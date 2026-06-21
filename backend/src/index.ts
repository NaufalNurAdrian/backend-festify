import "./instrument"; 

console.log("🔥 [BOOT] Starting application...");

process.on("uncaughtException", (err) => {
  console.error("🔥 [UNCAUGHT EXCEPTION]");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 [UNHANDLED REJECTION]");
  console.error(err);
});

import express, { Application, Request, Response } from "express";

console.log("✅ Express loaded");

import cors from "cors";
import cookieParser from "cookie-parser";

console.log("✅ Middleware loaded");

// =========================
// APP INIT
// =========================
const app: Application = express();

console.log("✅ App initialized");

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.BASE_URL_FE || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

console.log("✅ Middleware registered");

// =========================
// HEALTH CHECK (CLOUD RUN)
// =========================
app.get("/", (req: Request, res: Response) => {
  console.log("➡️ Health check hit");
  res.status(200).send("OK");
});

app.get("/api", (req: Request, res: Response) => {
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
const PORT = parseInt(process.env.PORT ?? "8080", 10);

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
} catch (err) {
  console.error("💥 FAILED TO START SERVER");
  console.error(err);
  process.exit(1);
}