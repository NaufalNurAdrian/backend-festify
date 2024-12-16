import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";

// Definisikan kelas router untuk tiket
export class TicketRouter {
  private ticketController: TicketController;
  private router: Router;

  constructor() {
    this.ticketController = new TicketController();
    this.router = Router();
    this.initializeRoutes();
  }

  // Inisialisasi routes dan pastikan handler sesuai dengan tipe yang diharapkan oleh Express
  private initializeRoutes() {
    // Gunakan handler async untuk route PATCH
    this.router.patch("/:slug/ticket/:ticket_id", (req, res) =>
      this.ticketController.updateSeat(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
