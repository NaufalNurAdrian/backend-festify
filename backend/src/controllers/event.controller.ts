import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "../../prisma/generated/client";
import { createSlug } from "../helpers/slug";
import { cloudinaryUpload } from "../services/cloudinary";
import { ParsedQs } from "qs";

// =========================
// SAFE QUERY PARSER (FIX FINAL)
// =========================
type QueryValue = string | string[] | undefined | ParsedQs | ParsedQs[];

const toString = (v: QueryValue): string | undefined => {
  if (!v) return undefined;

  if (typeof v === "string") return v;

  if (Array.isArray(v)) return toString(v[0] as any);

  return undefined;
};

export class EventController {
  // =========================
  // GET EVENTS (PUBLIC)
  // =========================
  async getEventId(req: Request, res: Response) {
    try {
      const search = toString(req.query.search as any);

      const filter: Prisma.EventWhereInput = {};

      if (search) {
        filter.title = { contains: search, mode: "insensitive" };
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

  // =========================
  // GET USER EVENTS
  // =========================
  async getEventUser(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).send({ message: "Unauthorized, login first" });
        return;
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

  // =========================
  // GET COMPLETED EVENTS
  // =========================
  async getEventCompleted(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).send({ message: "Unauthorized, login first" });
        return;
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

  // =========================
  // GET EVENT BY SLUG
  // =========================
  async getEventSlug(req: Request, res: Response) {
    try {
      const slug = toString(req.params.slug as any);

      if (!slug) {
        res.status(400).send({ message: "Slug is required" });
        return;
      }

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

  // =========================
  // CREATE EVENT
  // =========================
  async createEvent(req: Request, res: Response): Promise<void> {
    const { title, description, location, startTime, endTime, category } =
      req.body;

    const userId = Number(req.user?.user_id);

    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: "Thumbnail is required" });
        return;
      }

      const uploadResult = await cloudinaryUpload(req.file, "event");

      let slug = createSlug(title);
      let attempt = 0;

      while (await prisma.event.findUnique({ where: { slug } })) {
        attempt++;
        slug = createSlug(`${title}-${attempt}`);
      }

      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        res.status(400).json({ message: "Invalid date format" });
        return;
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          category,
          slug,
          thumbnail: uploadResult.secure_url,
          user_id: userId,
        },
      });

      res.status(201).json({
        message: "Event created successfully",
        event_id: event.event_id,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // =========================
  // CREATE TICKET
  // =========================
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const eventId = Number(req.params.eventId);
      const { tickets } = req.body;

      if (!tickets || tickets.length === 0) {
        res.status(400).json({ message: "At least one ticket is required" });
        return;
      }

      if (isNaN(eventId)) {
        res.status(400).json({ message: "Invalid eventId" });
        return;
      }

      for (const ticket of tickets) {
        if (!ticket.type || !ticket.seats || !ticket.lastOrder) {
          res.status(400).json({ message: "Invalid ticket data" });
          return;
        }

        if (
          ticket.type !== "FREE" &&
          (ticket.price === undefined || ticket.price <= 0)
        ) {
          res.status(400).json({
            message: "Invalid price for non-FREE ticket",
          });
          return;
        }
      }

      const ticketData = tickets.map((ticket: any) => ({
        type: ticket.type,
        price: ticket.type === "FREE" ? 0 : ticket.price,
        seats: ticket.seats,
        lastOrder: new Date(ticket.lastOrder),
        event_id: eventId,
      }));

      await prisma.ticket.createMany({
        data: ticketData,
      });

      res.status(201).json({
        message: "Tickets created successfully",
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Error creating tickets",
        error: error.message,
      });
    }
  }
}