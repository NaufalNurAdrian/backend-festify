import { Request, Response } from "express";
import prisma from "../prisma";

const toString = (v: string | string[] | undefined): string | undefined => {
  return Array.isArray(v) ? v[0] : v;
};

const toNumber = (v: string | undefined): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

export class TicketController {
  async updateSeat(req: Request, res: Response): Promise<void> {
    try {
      const slug = toString(req.params.slug);
      const ticketId = toNumber(toString(req.params.ticket_id));
      const seatsToBuy = Number(req.body.seatsToBuy);

      // =========================
      // VALIDATION
      // =========================
      if (!slug) {
        res.status(400).send({ message: "Slug tidak valid" });
        return;
      }

      if (!ticketId) {
        res.status(400).send({ message: "Ticket ID tidak valid" });
        return;
      }

      if (!seatsToBuy || seatsToBuy <= 0) {
        res.status(400).send({ message: "Jumlah kursi yang dibeli tidak valid" });
        return;
      }

      // =========================
      // FIND EVENT + TICKET
      // =========================
      const event = await prisma.event.findUnique({
        where: { slug },
        include: {
          Ticket: {
            where: {
              ticket_id: ticketId,
            },
          },
        },
      });

      if (!event || event.Ticket.length === 0) {
        res.status(404).send({ message: "Tiket tidak ditemukan" });
        return;
      }

      const ticket = event.Ticket[0];

      // =========================
      // CHECK SEATS
      // =========================
      if (ticket.seats < seatsToBuy) {
        res.status(400).send({ message: "Kursi tidak cukup tersedia" });
        return;
      }

      // =========================
      // UPDATE TICKET
      // =========================
      const updatedTicket = await prisma.ticket.update({
        where: { ticket_id: ticket.ticket_id },
        data: {
          seats: ticket.seats - seatsToBuy,
          lastOrder: new Date(),
        },
      });

      res.status(200).send({
        message: "Seat berhasil diupdate",
        updatedTicket,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Terjadi kesalahan server" });
    }
  }
}