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
      const deactiveEvent = await prisma.event.count({
        where: {
          user_id: userId, // Filter berdasarkan user_id
          status: "COMPLETED", // Event dengan status ACTIVE
        },
      });

      // Kirim response hanya sekali
      res.status(200).send({
        deactiveEvent,
        userId
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getTotalTransaction(req: Request, res: Response) {
    try {
      const userId = +req.params.user_id;

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
        totalTransaction: totalTransaction._sum.amount,
        userId,
        
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getIncomePerday(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id; // Pastikan `req.user` sudah tersedia dari middleware auth
      
      if (!user_id) {
        res.status(401).send({ message: "Unauthorized: user not logged in" });
      }

      // Query untuk menghitung total penghasilan per hari berdasarkan user_id
      const incomePerDay = await prisma.payment.groupBy({
        by: ["createdAt"], // Group berdasarkan tanggal
        _sum: {
          amount: true, // Hitung total jumlah `amount`
        },
        where: {
          user_id: user_id, // Filter berdasarkan user yang sedang login
          paymentStatus: "COMPLETED", // Hanya hitung pembayaran yang berhasil
        },
        orderBy: {
          createdAt: "asc", // Urutkan berdasarkan tanggal (opsional)
        },
      });

      // Format data untuk merapikan tanggal (hanya ambil tanggal tanpa waktu)
      const formattedData = incomePerDay.map((entry) => ({
        date: entry.createdAt.toISOString().split("T")[0], // Ambil tanggal (YYYY-MM-DD)
        totalIncome: entry._sum.amount || 0, // Total penghasilan (default 0 jika null)
      }));

      res.status(200).send({ incomePerDay: formattedData });
    } catch (error) {
      res.status(400).send({message: "cannot get data income per day"})
    }
  }
  
}
