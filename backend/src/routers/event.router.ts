import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { uploader } from "../services/uploader";
import {  verifyToken } from "../middleware/verify";

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
    this.router.get("/user", verifyToken, this.eventController.getEventUser);
    this.router.get("/completed",verifyToken, this.eventController.getEventCompleted);

    this.router.post(
      "/create/",
      verifyToken,

      uploader("memoryStorage", "event_").single("thumbnail"),
      this.eventController.createEvent
    );

    this.router.post(
      "/create/ticket/:eventId",
      verifyToken,
      this.eventController.createTicket
    );
    this.router.get("/:slug", this.eventController.getEventSlug);
  }

  getRouter(): Router {
    return this.router;
  }
}
