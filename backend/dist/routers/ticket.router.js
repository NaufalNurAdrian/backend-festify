"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRouter = void 0;
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
// Definisikan kelas router untuk tiket
class TicketRouter {
    constructor() {
        this.ticketController = new ticket_controller_1.TicketController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    // Inisialisasi routes dan pastikan handler sesuai dengan tipe yang diharapkan oleh Express
    initializeRoutes() {
        // Gunakan handler async untuk route PATCH
        this.router.patch("/:slug/ticket/:ticket_id", (req, res) => this.ticketController.updateSeat(req, res));
    }
    getRouter() {
        return this.router;
    }
}
exports.TicketRouter = TicketRouter;
