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
exports.EventController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const slug_1 = require("../helpers/slug");
const cloudinary_1 = require("../services/cloudinary");
const toString = (v) => {
    if (!v)
        return undefined;
    if (typeof v === "string")
        return v;
    if (Array.isArray(v))
        return toString(v[0]);
    return undefined;
};
class EventController {
    // =========================
    // GET EVENTS (PUBLIC)
    // =========================
    getEventId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const search = toString(req.query.search);
                const filter = {};
                if (search) {
                    filter.title = { contains: search, mode: "insensitive" };
                }
                const events = yield prisma_1.default.event.findMany({
                    where: Object.assign(Object.assign({}, filter), { status: "ACTIVE" }),
                    select: {
                        event_id: true,
                        title: true,
                        description: true,
                        location: true,
                        category: true,
                        startTime: true,
                        endTime: true,
                        slug: true,
                        thumbnail: true,
                        Ticket: {
                            select: {
                                price: true,
                            },
                        },
                        organizer: {
                            select: {
                                user_id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                });
                res.status(200).send({ events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send({ message: "Events Not Found" });
            }
        });
    }
    // =========================
    // GET USER EVENTS
    // =========================
    getEventUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
                    return;
                }
                const events = yield prisma_1.default.event.findMany({
                    where: {
                        status: "ACTIVE",
                        user_id: userId,
                    },
                    select: {
                        event_id: true,
                        title: true,
                        description: true,
                        location: true,
                        category: true,
                        startTime: true,
                        endTime: true,
                        slug: true,
                        thumbnail: true,
                        Ticket: {
                            select: {
                                price: true,
                            },
                        },
                        organizer: {
                            select: {
                                user_id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                });
                res.status(200).send({ events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send({ message: "Events Not Found" });
            }
        });
    }
    // =========================
    // GET COMPLETED EVENTS
    // =========================
    getEventCompleted(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
                    return;
                }
                const events = yield prisma_1.default.event.findMany({
                    where: {
                        status: "COMPLETED",
                        user_id: userId,
                    },
                    select: {
                        event_id: true,
                        title: true,
                        description: true,
                        location: true,
                        startTime: true,
                        endTime: true,
                        slug: true,
                        thumbnail: true,
                        Ticket: {
                            select: {
                                price: true,
                            },
                        },
                        organizer: {
                            select: {
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                });
                res.status(200).send({ events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send({ message: "Events Not Found" });
            }
        });
    }
    // =========================
    // GET EVENT BY SLUG
    // =========================
    getEventSlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slug = toString(req.params.slug);
                if (!slug) {
                    res.status(400).send({ message: "Slug is required" });
                    return;
                }
                const events = yield prisma_1.default.event.findUnique({
                    where: { slug },
                    select: {
                        event_id: true,
                        title: true,
                        category: true,
                        thumbnail: true,
                        slug: true,
                        description: true,
                        location: true,
                        startTime: true,
                        endTime: true,
                        organizer: {
                            select: {
                                username: true,
                                avatar: true,
                                email: true,
                            },
                        },
                        Ticket: {
                            select: {
                                ticket_id: true,
                                type: true,
                                price: true,
                                seats: true,
                                lastOrder: true,
                            },
                        },
                    },
                });
                res.status(200).send({ events });
            }
            catch (err) {
                console.log(err);
                res.status(400).send({ message: "Error Not Found" });
            }
        });
    }
    // =========================
    // CREATE EVENT
    // =========================
    createEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, description, location, startTime, endTime, category } = req.body;
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id);
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: { user_id: userId },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({ message: "Thumbnail is required" });
                    return;
                }
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "event");
                let slug = (0, slug_1.createSlug)(title);
                let attempt = 0;
                while (yield prisma_1.default.event.findUnique({ where: { slug } })) {
                    attempt++;
                    slug = (0, slug_1.createSlug)(`${title}-${attempt}`);
                }
                const parsedStartTime = new Date(startTime);
                const parsedEndTime = new Date(endTime);
                if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
                    res.status(400).json({ message: "Invalid date format" });
                    return;
                }
                const event = yield prisma_1.default.event.create({
                    data: {
                        title,
                        description,
                        location,
                        startTime: parsedStartTime,
                        endTime: parsedEndTime,
                        category,
                        slug,
                        thumbnail: uploadResult.secure_url,
                        user_id: userId,
                    },
                });
                res.status(201).json({
                    message: "Event created successfully",
                    event_id: event.event_id,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Internal server error",
                    error: error.message,
                });
            }
        });
    }
    // =========================
    // CREATE TICKET
    // =========================
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventId = Number(req.params.eventId);
                const { tickets } = req.body;
                if (!tickets || tickets.length === 0) {
                    res.status(400).json({ message: "At least one ticket is required" });
                    return;
                }
                if (isNaN(eventId)) {
                    res.status(400).json({ message: "Invalid eventId" });
                    return;
                }
                for (const ticket of tickets) {
                    if (!ticket.type || !ticket.seats || !ticket.lastOrder) {
                        res.status(400).json({ message: "Invalid ticket data" });
                        return;
                    }
                    if (ticket.type !== "FREE" &&
                        (ticket.price === undefined || ticket.price <= 0)) {
                        res.status(400).json({
                            message: "Invalid price for non-FREE ticket",
                        });
                        return;
                    }
                }
                const ticketData = tickets.map((ticket) => ({
                    type: ticket.type,
                    price: ticket.type === "FREE" ? 0 : ticket.price,
                    seats: ticket.seats,
                    lastOrder: new Date(ticket.lastOrder),
                    event_id: eventId,
                }));
                yield prisma_1.default.ticket.createMany({
                    data: ticketData,
                });
                res.status(201).json({
                    message: "Tickets created successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Error creating tickets",
                    error: error.message,
                });
            }
        });
    }
}
exports.EventController = EventController;
