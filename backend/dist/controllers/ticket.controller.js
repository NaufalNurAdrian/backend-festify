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
class TicketController {
    // Metode async untuk mengupdate jumlah kursi
    updateSeat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const event = yield prisma_1.default.event.findUnique({
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
                    const updatedTicket = yield prisma_1.default.ticket.update({
                        where: { ticket_id: ticket.ticket_id },
                        data: {
                            seats: ticket.seats - seatsToBuy,
                            lastOrder: new Date(), // Opsional: update waktu order terakhir
                        },
                    });
                    res.status(200).send({ updatedTicket });
                }
                else {
                    res.status(400).send({ message: "Kursi tidak cukup tersedia" });
                }
            }
            catch (err) {
                console.log(err);
                res.status(500).send({ message: "Terjadi kesalahan server" });
            }
        });
    }
}
exports.TicketController = TicketController;
