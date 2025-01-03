import { Request, Response } from "express";
import prisma from "../prisma";

export class DashboardController {
  async getEventActive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = req.user?.user_id;

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
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getEventDeactive(req: Request, res: Response) {
    try {
      // Ambil user_id dari parameter URL
      const userId = req.user?.user_id;

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
      });
    } catch (error) {
      console.error("Error fetching dashboard stats: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  async getTotalTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(400).send({ error: "Invalid user ID" });
      }

      const totalTransaction = await prisma.transaction.aggregate({
        _sum: {
          finalPrice: true,
        },
        where: {
          user_id: userId,
          paymentStatus: "COMPLETED",
        },
      });

      res.status(200).send({
        totalTransaction: totalTransaction._sum.finalPrice,
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

      // Fetch all transactions with completed payment status
      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          paymentStatus: "COMPLETED",
        },
        select: {
          createdAt: true,
          finalPrice: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Group by date (manual aggregation)
      const incomePerDay = transactions.reduce((acc, transaction) => {
        const date = transaction.createdAt.toISOString().split("T")[0]; // Extract date part only
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.finalPrice || 0; // Sum finalPrice
        return acc;
      }, {} as Record<string, number>);

      // Format the result
      const formattedData = Object.entries(incomePerDay).map(
        ([date, totalIncome]) => ({
          date,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerDay: formattedData });
    } catch (error) {
      console.error("Error fetching income per day: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async getIncomePerMonth(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).send({ message: "Unauthorized: user not logged in" });
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          paymentStatus: "COMPLETED",
        },
        select: {
          createdAt: true,
          finalPrice: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const incomePerMonth = transactions.reduce((acc, transaction) => {
        const month = transaction.createdAt.toISOString().slice(0, 7); // Format: YYYY-MM
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += transaction.finalPrice || 0; // Sum finalPrice
        return acc;
      }, {} as Record<string, number>);

      const formattedIncome = Object.entries(incomePerMonth).map(
        ([month, totalIncome]) => ({
          month,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerMonth: formattedIncome });
    } catch (error) {
      console.error("Error fetching income per month: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  // Get income per year
  async getIncomePerYear(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).send({ message: "Unauthorized: user not logged in" });
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          paymentStatus: "COMPLETED",
        },
        select: {
          createdAt: true,
          finalPrice: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const incomePerYear = transactions.reduce((acc, transaction) => {
        const year = transaction.createdAt.toISOString().slice(0, 4); // Format: YYYY
        if (!acc[year]) {
          acc[year] = 0;
        }
        acc[year] += transaction.finalPrice || 0; // Sum finalPrice
        return acc;
      }, {} as Record<string, number>);

      const formattedIncome = Object.entries(incomePerYear).map(
        ([year, totalIncome]) => ({
          year,
          totalIncome,
        })
      );

      res.status(200).send({ incomePerYear: formattedIncome });
    } catch (error) {
      console.error("Error fetching income per year: ", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}
