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
                      event_id: true,
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

      if (coupon.used) {
        // Jika kupon sudah terpakai, tidak menghitung diskon
        res.status(400).send({
          message: "Coupon has already been used. No discount applied.",
          finalPrice: transaction.totalPrice, // Harga tetap tanpa diskon
        });
        return;
      }

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

      res
        .status(200)
        .send({ message: "Coupon applied successfully", finalPrice });
    } catch (err) {
      console.error((err as Error).message);
      res.status(400).send({
        message: "Error applying coupon",
        error: (err as Error).message,
      });
    }
  }

  async applyPoint(req: Request, res: Response) {
    try {
      const { transaction_id, points } = req.body;
  
      // Validasi input
      const pointsToUse = parseInt(points, 10);
      if (isNaN(pointsToUse) || pointsToUse <= 0) {
        throw new Error("Invalid points provided");
      }
  
      // Ambil data transaksi dan poin pengguna
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: +transaction_id },
        include: {
          user: {
            select: {
              points: true,
            },
          },
        },
      });
  
      if (!transaction) throw new Error("Transaction not found");
      if (!transaction.user) throw new Error("User not associated with transaction");
  
      const userPoints = transaction.user.points || 0;
  
      if (userPoints < pointsToUse) {
        throw new Error("Insufficient points to apply for this transaction");
      }
  
      // Hitung harga final setelah potongan poin
      const pointDiscount = pointsToUse; // Misalnya 1 poin = 1 unit mata uang
      const finalPrice = Math.max(transaction.totalPrice - pointDiscount, 0);
  
      await prisma.$transaction(async (prisma) => {
        // Perbarui transaksi dengan harga final
        await prisma.transaction.update({
          where: { transaction_id: +transaction_id },
          data: { finalPrice },
        });
  
        // Kurangi poin dari pengguna
        await prisma.user.update({
          where: { user_id: transaction.user_id },
          data: { points: userPoints - pointsToUse },
        });
      });
  
      res
        .status(200)
        .send({ message: "Points applied successfully", finalPrice });
    } catch (err) {
      console.error((err as Error).message);
      res.status(400).send({
        message: "Error applying points",
        error: (err as Error).message,
      });
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
                  used: true, // Tambahkan properti 'used'
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

      // Logika untuk diskon hanya jika kupon valid dan belum digunakan
      const coupon = transaction.user?.coupon;
      let discountAmount = 0;

      if (coupon && !coupon.used && coupon.expiresAt > new Date()) {
        discountAmount = (transaction.totalPrice * coupon.discountAmount) / 100; // Diskon persentase
      }

      const finalPrice =
        transaction.OrderDetail.reduce((total, detail) => total + detail.subtotal!, 0) - discountAmount;
  
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
      if (discountAmount > 0) {
        item_details.push({
          id: "DISCOUNT",
          price: -discountAmount, // Harga negatif untuk diskon poin
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
