import { Request, Response } from "express";
import prisma from "../prisma";
import { requestBody } from "../types/reqBody";

const midtransClient = require("midtrans-client");

export class TransactionController {
  // Membuat transaksi baru
  async createTransaction(req: Request<{}, {}, requestBody>, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { totalPrice, finalPrice, OrderDetail } = req.body;
      const expiredAt = new Date(new Date().getTime() + 3 * 60000);

      const transactionId = await prisma.$transaction(async (prisma) => {
        // Membuat transaksi baru
        const { transaction_id } = await prisma.transaction.create({
          data: { user_id: userId!, totalPrice, finalPrice, expiredAt },
        });

        // Proses tiap item dalam orderDetail
        await Promise.all(
          OrderDetail.map(async (item) => {
            // Pastikan item.ticketId ada dan memiliki ticket_id yang valid
            if (!item.ticketId || !item.ticketId.ticket_id) {
              throw new Error(
                `Invalid ticket data for item: ${JSON.stringify(item)}`
              );
            }

            // Cek apakah tiket ada di database
            const ticket = await prisma.ticket.findUnique({
              where: { ticket_id: item.ticketId.ticket_id },
            });

            if (!ticket) {
              throw new Error(
                `Ticket not found with ID: ${item.ticketId.ticket_id}`
              );
            }

            // Cek ketersediaan kursi
            if (item.qty > ticket.seats) {
              throw new Error(
                `Insufficient seats for ticket ID: ${item.ticketId.ticket_id}`
              );
            }

            // Membuat orderDetail baru
            await prisma.orderDetail.create({
              data: {
                order_id: transaction_id,
                ticket_id: item.ticketId.ticket_id, // Pastikan ini adalah ID yang valid
                qty: item.qty,
                subtotal: item.qty * item.ticketId.price,
              },
            });

            // Mengupdate jumlah kursi setelah transaksi
            await prisma.ticket.update({
              where: { ticket_id: item.ticketId.ticket_id },
              data: { seats: { decrement: item.qty } },
            });
          })
        );

        console.log(OrderDetail);
        return transaction_id;
      });

      res
        .status(200)
        .send({ message: "Transaction created", order_id: transactionId });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .send({ message: "Error creating transaction", error: err });
    }
  }

  // Mendapatkan detail transaksi berdasarkan ID
  async getTransactionId(req: Request, res: Response) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: +req.params.transaction_id },
        select: {
          expiredAt: true,
          totalPrice: true,
          finalPrice: true,
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
        },
      });
      res.status(200).send({ result: transaction });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  // Mendapatkan token Midtrans Snap
  async getSnapToken(req: Request, res: Response) {
    try {
      const { order_id } = req.body;

      // Validasi transaksi
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: order_id },
      });
      if (!transaction) throw new Error("Transaction not found");

      // Periksa apakah transaksi sudah gagal sebelumnya
      if (transaction.paymentStatus === "FAILED") {
        throw new Error(
          "Cannot continue with this transaction as it is marked as failed."
        );
      }

      const item_details = await prisma.orderDetail
        .findMany({
          where: { order_id },
          include: { ticketId: { select: { type: true } } },
        })
        .then((details) =>
          details.map((detail) => ({
            id: detail.ticket_id,
            price: detail.subtotal! / detail.qty,
            quantity: detail.qty,
            name: detail.ticketId.type,
          }))
        );

      const user = await prisma.user.findUnique({
        where: { user_id: req.user?.user_id },
      });

      const uniqueOrderId = `${order_id}${Math.floor(Math.random() * 1000000)}`;
      console.log("unikorderID: ", uniqueOrderId);

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MID_SERVER_KEY,
      });

      const parameters = {
        transaction_details: {
          order_id: uniqueOrderId.toString(),
          gross_amount: transaction.finalPrice,
        },
        customer_details: {
          first_name: user?.username,
          email: user?.email,
          phone: user?.phone,
        },
        item_details,
        expiry: {
          unit: "minutes",
          duration: 30,
        },
      };

      const snapTransaction = await snap.createTransaction(parameters);
      res.status(200).send({ result: snapTransaction.token });
    } catch (err) {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      res
        .status(400)
        .send({ message: "Failed to create snap token", error: err });
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
          where: { order_id: +order_id },
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
        data: { paymentStatus: newStatus },
      });

      res.status(200).send({ message: "Status transaksi berhasil diperbarui" });
    } catch (err) {
      console.error(err);
      res.status(400).send({ message: "Terjadi kesalahan", error: err });
    }
  }
}
