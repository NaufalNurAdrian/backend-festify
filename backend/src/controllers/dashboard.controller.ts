import { Request, Response } from "express";
import prisma from "../prisma";

export class DashboardController {
  async getEventActive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = +req.params.user_id;

      if (!userId) {
        res.status(400).send({ error: "Invalid user ID" });
      }

      // Query untuk menghitung jumlah event aktif berdasarkan user
      const activeEvent = await prisma.event.count({
        where: {
          user_id: userId, // Filter berdasarkan user_id
          status: "ACTIVE", // Event dengan status ACTIVE
        },
      });

      // Kirim response hanya sekali
      res.status(200).send({
        activeEvent,
        userId
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getEventDeactive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = +req.params.user_id;

      if (!userId) {
        res.status(400).send({ error: "Invalid user ID" });
      }

      // Query untuk menghitung jumlah event aktif berdasarkan user
      const activeEvent = await prisma.event.count({
        where: {
          user_id: userId, // Filter berdasarkan user_id
          status: "COMPLETED", // Event dengan status ACTIVE
        },
      });

      // Kirim response hanya sekali
      res.status(200).send({
        activeEvent,
        userId
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  
}
