"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRouter = void 0;
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const uploader_1 = require("../services/uploader");
const verify_1 = require("../middleware/verify");
class EventRouter {
    constructor() {
        this.eventController = new event_controller_1.EventController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.eventController.getEventId);
        this.router.get("/user", verify_1.verifyToken, this.eventController.getEventUser);
        this.router.get("/completed", verify_1.verifyToken, this.eventController.getEventCompleted);
        this.router.post("/create/", verify_1.verifyToken, (0, uploader_1.uploader)("memoryStorage", "event_").single("thumbnail"), this.eventController.createEvent);
        this.router.post("/create/ticket/:eventId", verify_1.verifyToken, this.eventController.createTicket);
        this.router.get("/:slug", this.eventController.getEventSlug);
    }
    getRouter() {
        return this.router;
    }
}
exports.EventRouter = EventRouter;
