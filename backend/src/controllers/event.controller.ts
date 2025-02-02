import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { Prisma, TicketType } from "../../prisma/generated/client";
import { createSlug } from "../helpers/slug";
import { cloudinaryUpload } from "../services/cloudinary";

export class EventController {
  async getEventId(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const filter: Prisma.EventWhereInput = {};
      if (search) {
        filter.title = { contains: search as string, mode: "insensitive" };
      }
      const events = await prisma.event.findMany({
        where: {
          ...filter,
          status: "ACTIVE",
        },
        select: {
          event_id: true,
          title: true,
          description: true,
          location: true,
          category: true,
          startTime: true,
          endTime: true,
          slug: true,
          thumbnail: true,
          Ticket: {
            select: {
              price: true,
            },
          },
          organizer: {
            select: {
              user_id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      res.status(200).send({ events });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Events Not Found" });
    }
  }
  async getEventUser(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).send({ message: "Unauthorized, login first" });
      }

      const events = await prisma.event.findMany({
        where: {
          status: "ACTIVE",
          user_id: userId,
        },
        select: {
          event_id: true,
          title: true,
          description: true,
          location: true,
          category: true,
          startTime: true,
          endTime: true,
          slug: true,
          thumbnail: true,
          Ticket: {
            select: {
              price: true,
            },
          },
          organizer: {
            select: {
              user_id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
      res.status(200).send({ events });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Events Not Found" });
    }
  }

  async getEventCompleted(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        res.status(401).send({ message: "Unauthorized, login first" });
      }
      const events = await prisma.event.findMany({
        where: {
          status: "COMPLETED",
          user_id: userId,
        },
        select: {
          event_id: true,
          title: true,
          description: true,
          location: true,
          startTime: true,
          endTime: true,
          slug: true,
          thumbnail: true,
          Ticket: {
            select: {
              price: true,
            },
          },
          organizer: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });
      res.status(200).send({ events });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Events Not Found" });
    }
  }

  async getEventSlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const events = await prisma.event.findUnique({
        where: { slug },
        select: {
          event_id: true,
          title: true,
          category: true,
          thumbnail: true,
          slug: true,
          description: true,
          location: true,
          startTime: true,
          endTime: true,
          organizer: {
            select: {
              username: true,
              avatar: true,
              email: true,
            },
          },
          Ticket: {
            select: {
              ticket_id: true,
              type: true,
              price: true,
              seats: true,
              lastOrder: true,
            },
          },
        },
      });
      res.status(200).send({ events });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Error Not Found" });
    }
  }
  async createEvent(req: Request, res: Response): Promise<void> {
    const { title, description, location, startTime, endTime, category } =
      req.body;

    const userId = Number(req.user?.user_id);

    try {
      // Validasi user
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Validasi dan unggah thumbnail ke Cloudinary
      if (!req.file) {
        res.status(400).json({ message: "Thumbnail is required" });
        return;
      }

      const uploadResult = await cloudinaryUpload(req.file, "event");

      // Generate slug unik
      let slug = createSlug(title);
      let attempt = 0;
      while (await prisma.event.findUnique({ where: { slug } })) {
        attempt++;
        slug = createSlug(`${title}-${attempt}`);
      }

      // Validasi waktu
      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);
      if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        res
          .status(400)
          .json({ message: "Invalid date format for startTime or endTime" });
        return;
      }

      // Buat event di database
      const event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          category,
          slug,
          thumbnail: uploadResult.secure_url, // URL hasil upload
          user_id: userId,
        },
      });

      res.status(201).json({
        message: "Event created successfully",
        event_id: event.event_id, // Kembalikan event_id untuk pembuatan tiket
      });
    } catch (error: any) {
      console.error("Error caught in createEvent:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { tickets } = req.body;

      // Pastikan ada tiket yang dikirimkan
      if (!tickets || tickets.length === 0) {
        res.status(400).json({
          message: "At least one ticket is required",
        });
        return;
      }

      // Konversi eventId menjadi number
      const parsedEventId = parseInt(eventId, 10);
      if (isNaN(parsedEventId) || parsedEventId <= 0) {
        res.status(400).json({
          message: "Invalid eventId. It must be a positive number.",
        });
        return;
      }

      // Validasi tiket
      for (const ticket of tickets) {
        if (!ticket.type || !ticket.seats || !ticket.lastOrder) {
          res.status(400).json({
            message: "Each ticket must have a type, seats, and lastOrder.",
          });
          return;
        }

        if (
          ticket.type !== "FREE" &&
          (ticket.price === undefined || ticket.price <= 0)
        ) {
          res.status(400).json({
            message: "Non-FREE tickets must have a price greater than 0.",
          });
          return;
        }
      }

      // Proses pembuatan tiket
      const ticketData = tickets.map((ticket: any) => {
        if (ticket.type === "FREE" && ticket.price !== 0) {
          ticket.price = 0; // Pastikan harga untuk tiket FREE adalah 0
        }

        return {
          ticket_id: ticket.ticket_id,
          type: ticket.type,
          price: ticket.price,
          seats: ticket.seats,
          lastOrder: new Date(ticket.lastOrder),
          event_id: parsedEventId,
        };
      });

      // Simpan tiket ke database
      try {
        await prisma.ticket.createMany({ data: ticketData });
        res.status(201).json({
          message: "Tickets created successfully",
        });
      } catch (error: any) {
        console.error("Prisma Error: ", error.message);
        res.status(500).json({
          message: "Error saving tickets to the database",
          error: error.message,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error creating tickets",
      });
    }
  }
}
