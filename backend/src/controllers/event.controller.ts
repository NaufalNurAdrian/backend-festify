import { Request, Response } from "express";
import prisma from "../prisma";

export class EventController {
  async getEventId(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
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
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Error Not Found" });
    }
  }
}
