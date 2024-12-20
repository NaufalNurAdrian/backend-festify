import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { uploader } from "../services/uploader";
import { checkAdmin, verifyToken } from "../middleware/verify";

export class EventRouter {
  private eventController: EventController;
  private router: Router;

  constructor() {
    this.eventController = new EventController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.eventController.getEventId);

    this.router.post(
      "/create/:user_id",

      uploader("memoryStorage", "event_").single("thumbnail"),
      this.eventController.createEvent
    );

    this.router.post(
      "/create/ticket/:event_id",
      this.eventController.createTicket
    );
    this.router.get("/:slug", this.eventController.getEventSlug);
  }

  getRouter(): Router {
    return this.router;
  }
}
