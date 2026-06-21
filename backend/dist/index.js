"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("🔥 [BOOT] Starting application...");
process.on("uncaughtException", (err) => {
    console.error("🔥 [UNCAUGHT EXCEPTION]");
    console.error(err);
});
process.on("unhandledRejection", (err) => {
    console.error("🔥 [UNHANDLED REJECTION]");
    console.error(err);
});
const express_1 = __importDefault(require("express"));
console.log("✅ Express loaded");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
console.log("✅ Middleware loaded");
// =========================
// APP INIT
// =========================
const app = (0, express_1.default)();
console.log("✅ App initialized");
// =========================
// MIDDLEWARE
// =========================
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL_FE || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
console.log("✅ Middleware registered");
// =========================
// HEALTH CHECK (CLOUD RUN)
// =========================
app.get("/", (req, res) => {
    console.log("➡️ Health check hit");
    res.status(200).send("OK");
});
app.get("/api", (req, res) => {
    console.log("➡️ API base hit");
    res.status(200).send("Welcome to my API");
});
// =========================
// ROUTER INIT (STEP BY STEP DEBUG)
// =========================
console.log("⏳ Loading routers...");
const authRouter = new (require("./routers/auth.router").AuthRouter)();
console.log("✔ AuthRouter loaded");
const userRouter = new (require("./routers/user.router").UserRouter)();
console.log("✔ UserRouter loaded");
const eventsRouter = new (require("./routers/event.router").EventRouter)();
console.log("✔ EventRouter loaded");
const ticketRouter = new (require("./routers/ticket.router").TicketRouter)();
console.log("✔ TicketRouter loaded");
const transactionRouter = new (require("./routers/order.router").TransactionRouter)();
console.log("✔ TransactionRouter loaded");
const dashboardRouter = new (require("./routers/dashboard.router").DashboardRouter)();
console.log("✔ DashboardRouter loaded");
const reviewRouter = new (require("./routers/review.router").ReviewRouter)();
console.log("✔ ReviewRouter loaded");
// =========================
// ROUTES
// =========================
app.use("/api/auth", authRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/event", eventsRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());
app.use("/api/dashboard", dashboardRouter.getRouter());
app.use("/api/reviews", reviewRouter.getRouter());
console.log("✅ Routes registered");
// =========================
// PORT (CLOUD RUN SAFE)
// =========================
const PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "8080", 10);
console.log("🔧 PORT =", PORT);
console.log("🌍 BASE_URL_FE =", process.env.BASE_URL_FE);
console.log("🔐 DATABASE_URL =", process.env.DATABASE_URL ? "SET" : "MISSING");
// =========================
// START SERVER (SAFE WRAP)
// =========================
try {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
    });
}
catch (err) {
    console.error("💥 FAILED TO START SERVER");
    console.error(err);
    process.exit(1);
}
