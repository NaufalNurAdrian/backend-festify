import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { uploader } from "../services/uploader";

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
    this.router.get("/:slug", this.eventController.getEventSlug);
    this.router.post(
      "/create/:organizer",
      uploader("memoryStorage", "event_").single("thumbnail"),
      this.eventController.createEvent
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
