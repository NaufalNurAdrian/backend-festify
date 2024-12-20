import { Request, Response } from "express";
import prisma from "../prisma";

export class DashboardController {
  async getEventActive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = req.user?.user_id

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
        activeEvent
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getEventDeactive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = req.user?.user_id

      if (!userId) {
        res.status(400).send({ error: "Invalid user ID" });
      }

      // Query untuk menghitung jumlah event aktif berdasarkan user
      const deactiveEvent = await prisma.event.count({
        where: {
          user_id: userId, // Filter berdasarkan user_id
          status: "COMPLETED", // Event dengan status ACTIVE
        },
      });

      // Kirim response hanya sekali
      res.status(200).send({
        deactiveEvent
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getTotalTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id

      if (!userId) {
        res.status(400).send({ error: "Invalid user ID" });
      }

      
      const totalTransaction = await prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          user_id: userId, 
          paymentStatus: "COMPLETED",
        },
      });

      res.status(200).send({
        totalTransaction: totalTransaction._sum.amount
        
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getIncomePerday(req: Request, res: Response) {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      res.status(401).send({ message: "Unauthorized: user not logged in" });
    }

    const incomePerDay = await prisma.payment.groupBy({
      by: ["createdAt"], // Pastikan properti ada di model Prisma
      _sum: {
        amount: true,
      },
      where: {
        user_id: userId,
        paymentStatus: "COMPLETED",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format data
    const formattedData = incomePerDay.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0], // Format tanggal
      totalIncome: entry._sum.amount ?? 0, // Gunakan default value
    }));

    res.status(200).send({ incomePerDay: formattedData });
  } catch (error) {
    console.error("Error fetching income per day: ", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

  
}
