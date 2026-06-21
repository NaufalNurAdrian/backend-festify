"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const toString = (v) => {
    return Array.isArray(v) ? v[0] : v;
};
const toNumber = (v) => {
    if (!v)
        return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
};
class TicketController {
    updateSeat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const event = yield prisma_1.default.event.findUnique({
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
                const updatedTicket = yield prisma_1.default.ticket.update({
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
            }
            catch (err) {
                console.error(err);
                res.status(500).send({ message: "Terjadi kesalahan server" });
            }
        });
    }
}
exports.TicketController = TicketController;
