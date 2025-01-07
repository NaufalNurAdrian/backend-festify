import { Request, Response } from "express";
import prisma from "../prisma";

export class ReviewController {
  async addRating(req: Request, res: Response) {
    try {
      const { rating, review } = req.body;
      const userId = req.user?.user_id;
      const eventId = req.params.eventId;

      await prisma.review.create({
        data: {
          userId: userId!,
          eventId: +eventId,
          rating: rating,
          review: review,
        },
      });

      res.status(201).send({ message: "Review added successfully" });
    } catch (error) {
      console.log("Error add review:", error);
      res.status(400).send(error);
    }
  }

  async getReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.review.findMany({
        where: { eventId: +req.params.eventId },
        select: {
          review: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              user_id: true,
              username: true,
            },
          },
        },
      });

      res.status(200).send({ reviews });
    } catch (error) {
      console.log("Error get reviews:", error);
      res.status(400).send(error);
    }
  }
}
