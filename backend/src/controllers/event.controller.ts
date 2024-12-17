import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
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
        where: filter,
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

  async createEvent(req: Request, res: Response) {
    try {
      const { title, description, category, startTime, endTime, location } =
        req.body;

      const slug = createSlug(title);
      const { organizer } = req.params;

      let thumbnailUrl = "";

      // Cek apakah ada file thumbnail di request
      if (req.file) {
        const result = await cloudinaryUpload(req.file, "events");
        thumbnailUrl = result.secure_url;
      }

      // Simpan event ke database
      await prisma.event.create({
        data: {
          title,
          description,
          category,
          startTime,
          endTime,
          location,
          thumbnail: thumbnailUrl,
          slug,
          organizer: {
            connect: { user_id: +organizer },
          },
        },
      });

      res.status(200).send({ message: "Event created successfully" });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: "Error" });
    }
  }

  // async createTicket(req: Request, res: Response) {
  //   try {
  //     const {};
  //   } catch (err) {}
  // }
}
