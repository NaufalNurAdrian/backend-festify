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
class EventController {
    getEventId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search } = req.query;
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
    getEventUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
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
    getEventCompleted(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
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
    getEventSlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
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
    createEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, description, location, startTime, endTime, category } = req.body;
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id);
            try {
                // Validasi user
                const user = yield prisma_1.default.user.findUnique({
                    where: { user_id: userId },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                // Validasi dan unggah thumbnail ke Cloudinary
                if (!req.file) {
                    res.status(400).json({ message: "Thumbnail is required" });
                    return;
                }
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "event");
                // Generate slug unik
                let slug = (0, slug_1.createSlug)(title);
                let attempt = 0;
                while (yield prisma_1.default.event.findUnique({ where: { slug } })) {
                    attempt++;
                    slug = (0, slug_1.createSlug)(`${title}-${attempt}`);
                }
                // Validasi waktu
                const parsedStartTime = new Date(startTime);
                const parsedEndTime = new Date(endTime);
                if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
                    res
                        .status(400)
                        .json({ message: "Invalid date format for startTime or endTime" });
                    return;
                }
                // Buat event di database
                const event = yield prisma_1.default.event.create({
                    data: {
                        title,
                        description,
                        location,
                        startTime: parsedStartTime,
                        endTime: parsedEndTime,
                        category,
                        slug,
                        thumbnail: uploadResult.secure_url, // URL hasil upload
                        user_id: userId,
                    },
                });
                res.status(201).json({
                    message: "Event created successfully",
                    event_id: event.event_id, // Kembalikan event_id untuk pembuatan tiket
                });
            }
            catch (error) {
                console.error("Error caught in createEvent:", error);
                res
                    .status(500)
                    .json({ message: "Internal server error", error: error.message });
            }
        });
    }
    createTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                const { tickets } = req.body;
                // Pastikan ada tiket yang dikirimkan
                if (!tickets || tickets.length === 0) {
                    res.status(400).json({
                        message: "At least one ticket is required",
                    });
                    return;
                }
                // Konversi eventId menjadi number
                const parsedEventId = parseInt(eventId, 10);
                if (isNaN(parsedEventId) || parsedEventId <= 0) {
                    res.status(400).json({
                        message: "Invalid eventId. It must be a positive number.",
                    });
                    return;
                }
                // Validasi tiket
                for (const ticket of tickets) {
                    if (!ticket.type || !ticket.seats || !ticket.lastOrder) {
                        res.status(400).json({
                            message: "Each ticket must have a type, seats, and lastOrder.",
                        });
                        return;
                    }
                    if (ticket.type !== "FREE" &&
                        (ticket.price === undefined || ticket.price <= 0)) {
                        res.status(400).json({
                            message: "Non-FREE tickets must have a price greater than 0.",
                        });
                        return;
                    }
                }
                // Proses pembuatan tiket
                const ticketData = tickets.map((ticket) => {
                    if (ticket.type === "FREE" && ticket.price !== 0) {
                        ticket.price = 0; // Pastikan harga untuk tiket FREE adalah 0
                    }
                    return {
                        ticket_id: ticket.ticket_id,
                        type: ticket.type,
                        price: ticket.price,
                        seats: ticket.seats,
                        lastOrder: new Date(ticket.lastOrder),
                        event_id: parsedEventId,
                    };
                });
                // Simpan tiket ke database
                try {
                    yield prisma_1.default.ticket.createMany({ data: ticketData });
                    res.status(201).json({
                        message: "Tickets created successfully",
                    });
                }
                catch (error) {
                    console.error("Prisma Error: ", error.message);
                    res.status(500).json({
                        message: "Error saving tickets to the database",
                        error: error.message,
                    });
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Error creating tickets",
                });
            }
        });
    }
}
exports.EventController = EventController;
