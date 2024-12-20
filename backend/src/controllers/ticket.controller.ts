import { Request, Response } from "express";
import prisma from "../prisma";

export class TicketController {
  // Metode async untuk mengupdate jumlah kursi
  async updateSeat(req: Request, res: Response): Promise<void> {
    try {
      const { slug, ticket_id } = req.params;
      const { seatsToBuy } = req.body;

      // Validasi jika seatsToBuy tidak valid
      if (!seatsToBuy || seatsToBuy <= 0) {
        res
          .status(400)
          .send({ message: "Jumlah kursi yang dibeli tidak valid" });
        return;
      }

      // Mencari event berdasarkan slug dan ticket_id
      const event = await prisma.event.findUnique({
        where: { slug },
        include: {
          Ticket: {
            where: { ticket_id: Number(ticket_id) },
          },
        },
      });

      if (!event || !event.Ticket.length) {
        res.status(404).send({ message: "Tiket tidak ditemukan" });
        return;
      }

      const ticket = event.Ticket[0];

      // Memeriksa apakah kursi yang tersedia cukup
      if (ticket.seats >= seatsToBuy) {
        // Mengupdate jumlah kursi yang tersedia
        const updatedTicket = await prisma.ticket.update({
          where: { ticket_id: ticket.ticket_id },
          data: {
            seats: ticket.seats - seatsToBuy,
            lastOrder: new Date(), // Opsional: update waktu order terakhir
          },
        });

        res.status(200).send({ updatedTicket });
      } else {
        res.status(400).send({ message: "Kursi tidak cukup tersedia" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Terjadi kesalahan server" });
    }
  }
}
