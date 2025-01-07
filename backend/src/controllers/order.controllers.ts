import { Request, Response } from "express";
import prisma from "../prisma";
import { requestBody } from "../types/reqBody";

const midtransClient = require("midtrans-client");

export class TransactionController {
  // Membuat transaksi baru
  async createTransaction(req: Request<{}, {}, requestBody>, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { totalPrice, OrderDetail } = req.body;
      const expiredAt = new Date(new Date().getTime() + 15 * 60000);

      const transactionId = await prisma.$transaction(async (prisma) => {
        // Buat transaksi baru
        const transaction = await prisma.transaction.create({
          data: {
            user_id: userId!,
            totalPrice,
            finalPrice: totalPrice, // Harga akhir belum dikurangi diskon
            expiredAt,
            coupon_Id: null, // Kupon akan diproses nanti
          },
        });

        // Proses tiap item dalam orderDetail
        await Promise.all(
          OrderDetail.map(async (item) => {
            const ticket = await prisma.ticket.findUnique({
              where: { ticket_id: item.ticketId.ticket_id },
            });

            if (!ticket) {
              throw new Error(
                `Ticket not found with ID: ${item.ticketId.ticket_id}`
              );
            }

            if (item.qty > ticket.seats) {
              throw new Error(
                `Insufficient seats for ticket ID: ${item.ticketId.ticket_id}`
              );
            }

            // Buat orderDetail baru
            await prisma.orderDetail.create({
              data: {
                orderId: transaction.transaction_id,
                ticket_id: item.ticketId.ticket_id,
                qty: item.qty,
                subtotal: item.qty * ticket.price,
              },
            });

            // Kurangi jumlah kursi
            await prisma.ticket.update({
              where: { ticket_id: item.ticketId.ticket_id },
              data: { seats: { decrement: item.qty } },
            });
          })
        );

        return transaction.transaction_id;
      });

      res
        .status(200)
        .send({ message: "Transaction created", orderId: transactionId });
    } catch (err) {
      console.error((err as Error).message);
      res.status(400).send({
        message: "Error creating transaction",
        error: (err as Error).message,
      });
    }
  }

  // Mendapatkan detail transaksi berdasarkan ID
  async getTransactionId(req: Request, res: Response) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: +req.params.transaction_id },
        include: {
          OrderDetail: {
            select: {
              qty: true,
              subtotal: true,
              ticketId: {
                select: {
                  ticket_id: true,
                  type: true,
                  price: true,
                  seats: true,
                  event: {
                    select: {
                      title: true,
                      thumbnail: true,
                      startTime: true,
                      endTime: true,
                      location: true,
                      category: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              points: true,
              coupon: {
                select: {
                  coupon_id: true,
                  discountAmount: true,
                  expiresAt: true,
                  used: true,
                },
                where: {
                  used: false,
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Cek apakah kupon valid (belum expired dan belum digunakan)
      const coupon = transaction.user?.coupon;
      const validCoupon =
        coupon && !coupon.used && coupon.expiresAt > new Date()
          ? {
              coupon_id: coupon.coupon_id,
              discountAmount: coupon.discountAmount,
              expiresAt: coupon.expiresAt,
            }
          : null;

      res.status(200).send({
        result: {
          ...transaction,
          discount: validCoupon, // Kirim informasi kupon yang valid
        },
      });
    } catch (err) {
      console.error((err as Error).message);
      res.status(400).send({
        message: "Error retrieving transaction",
        error: (err as Error).message,
      });
    }
  }

  async applyCoupon(req: Request, res: Response) {
    try {
      const { transaction_id, coupon_id } = req.body;

      // Convert coupon_id to an integer
      const coupon_id_int = parseInt(coupon_id, 10);
      if (isNaN(coupon_id_int)) {
        throw new Error("Invalid coupon_id provided");
      }

      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id, user: { coupon: { used: false } } },
        include: { user: { select: { coupon: true } } },
      });

      if (!transaction) throw new Error("Transaction not found");

      const coupon = await prisma.coupon.findUnique({
        where: { coupon_id: coupon_id_int },
      });

      if (!coupon) throw new Error("Coupon not found");
      if (coupon.used) throw new Error("Coupon has already been used");
      if (coupon.expiresAt < new Date()) throw new Error("Coupon has expired");

      // Calculate the discount based on percentage
      const discountAmount =
        (transaction.totalPrice * coupon.discountAmount) / 100;
      const finalPrice = Math.max(transaction.totalPrice - discountAmount, 0);

      await prisma.$transaction(async (prisma) => {
        await prisma.transaction.update({
          where: { transaction_id },
          data: { finalPrice, coupon_Id: coupon_id_int },
        });

        await prisma.coupon.update({
          where: { coupon_id: coupon_id_int },
          data: { used: true },
        });
      });

      res.status(200).send({ message: "Coupon applied successfully" });
    } catch (err) {
      console.error((err as Error).message);
      res.status(400).send({
        message: "Error applying coupon",
        error: (err as Error).message,
      });
    }
  }

  async updateUserPoints(req: Request, res: Response) {
    try {
      const { points } = req.body;
      const userId = req.user?.user_id; // Mengambil user_id dari session atau token

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
      }

      if (typeof points !== "number" || points <= 0) {
        res.status(400).json({ message: "Invalid points value" });
      }

      // Ambil data pengguna untuk memeriksa saldo poin
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { points: true },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
      }

      if (user!.points < points) {
        res.status(400).json({ message: "Not enough points" });
      }

      // Kurangi poin pengguna
      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data: {
          points: user!.points - points,
        },
      });


      res.status(200).json({ success: true, points: updatedUser.points });
    } catch (err) {
      console.error("Error deducting user points:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Mendapatkan token Midtrans Snap
  async getSnapToken(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
  
      // Ambil transaksi berdasarkan ID
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: orderId },
        include: {
          OrderDetail: {
            include: {
              ticketId: { select: { type: true } },
            },
          },
          user: {
            select: {
              username: true,
              email: true,
              phone: true,
              points: true,
              coupon: {
                select: {
                  discountAmount: true, // Assuming this is percentage-based
                  expiresAt: true,
                },
              },
            },
          },
        },
      });
  
      if (!transaction) throw new Error("Transaction not found");
  
      if (transaction.paymentStatus === "FAILED") {
        throw new Error(
          "Cannot continue with this transaction as it is marked as failed."
        );
      }
  
      // Hitung harga akhir transaksi dengan memperhitungkan diskon jika ada
      const couponDiscount = transaction.user?.coupon?.discountAmount || 0;
      const pointDiscount = transaction.user.points || 0;
  
      // Diskon berdasarkan kupon
      const discountAmount = (transaction.totalPrice * couponDiscount) / 100;
  
      // Hitung diskon dari poin, misalnya setiap 100 poin = 1 unit diskon
      const pointDiscountAmount = pointDiscount / 100; // Contoh konversi: 1 poin = 1 unit diskon
  
      // Total diskon
      const totalDiscount = discountAmount + pointDiscountAmount;
  
      // Hitung harga akhir setelah diskon
      const finalPrice =
        transaction.OrderDetail.reduce((total, detail) => total + detail.subtotal!, 0) - totalDiscount;
  
      if (finalPrice <= 0) {
        throw new Error("Final price cannot be zero or negative.");
      }
  
      type TicketType = string;
  
      type ItemDetail = {
        id: number | "DISCOUNT"; // ID untuk item atau diskon
        price: number;
        quantity: number;
        name: TicketType | "Discount"; // Nama tipe tiket atau "Discount"
      };
  
      // Format item details untuk Midtrans
      const item_details: ItemDetail[] = transaction.OrderDetail.map((detail) => ({
        id: detail.ticket_id,
        price: detail.subtotal! / detail.qty,
        quantity: detail.qty,
        name: detail.ticketId.type,
      }));
  
      // Tambahkan item diskon kupon
      if (discountAmount > 0) {
        item_details.push({
          id: "DISCOUNT",
          price: -discountAmount, // Harga negatif untuk diskon kupon
          quantity: 1,
          name: "Coupon Discount",
        });
      }
  
      // Tambahkan item diskon poin
      if (pointDiscountAmount > 0) {
        item_details.push({
          id: "DISCOUNT",
          price: -pointDiscountAmount, // Harga negatif untuk diskon poin
          quantity: 1,
          name: "Point Discount",
        });
      }
  
      // Buat Snap token menggunakan Midtrans SDK
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MID_SERVER_KEY,
      });
  
      const parameters = {
        transaction_details: {
          order_id: orderId.toString(),
          gross_amount: finalPrice,
        },
        customer_details: {
          first_name: transaction.user?.username,
          email: transaction.user?.email,
          phone: transaction.user?.phone,
        },
        item_details,
        expiry: {
          unit: "minutes",
          duration: 15,
        },
      };
  
      const snapTransaction = await snap.createTransaction(parameters);
  
      res.status(200).send({ result: snapTransaction.token });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: "Failed to create snap token" });
    }
  }
  

  // Webhook Midtrans untuk memperbarui status transaksi
  async midtransWebhook(req: Request, res: Response) {
    try {
      const { transaction_status, order_id } = req.body;
      console.log("orderId:", +order_id);

      const newStatus =
        transaction_status === "settlement"
          ? "COMPLETED"
          : transaction_status === "pending"
          ? "PENDING"
          : "FAILED";

      if (newStatus === "FAILED") {
        const orderDetails = await prisma.orderDetail.findMany({
          where: { orderId: +order_id },
          select: { qty: true, ticket_id: true },
        });

        for (const item of orderDetails) {
          await prisma.ticket.update({
            where: { ticket_id: item.ticket_id },
            data: { seats: { increment: item.qty } },
          });
        }
      }

      await prisma.transaction.update({
        where: { transaction_id: +order_id },
        data: {
          paymentStatus: newStatus,
        },
      });

      res.status(200).send({ message: "Success" });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: "Terjadi kesalahan", error: err });
    }
  }
}
