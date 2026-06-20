import dotenv from "dotenv";
dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED:", err);
});

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routers
import { AuthRouter } from "./routers/auth.router";
import { UserRouter } from "./routers/user.router";
import { EventRouter } from "./routers/event.router";
import { TicketRouter } from "./routers/ticket.router";
import { DashboardRouter } from "./routers/dashboard.router";
import { TransactionRouter } from "./routers/order.router";
import { ReviewRouter } from "./routers/review.router";

// =========================
// APP INIT
// =========================
const app: Application = express();

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

// =========================
// HEALTH CHECK (CLOUD RUN)
// =========================
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

// =========================
// ROUTES
// =========================
const authRouter = new AuthRouter();
const userRouter = new UserRouter();
const eventsRouter = new EventRouter();
const ticketRouter = new TicketRouter();
const transactionRouter = new TransactionRouter();
const dashboardRouter = new DashboardRouter();
const reviewRouter = new ReviewRouter();

app.use("/api/auth", authRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/event", eventsRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());
app.use("/api/dashboard", dashboardRouter.getRouter());
app.use("/api/reviews", reviewRouter.getRouter());

// =========================
// PORT (CLOUD RUN SAFE)
// =========================
const PORT = parseInt(process.env.PORT ?? "8080", 10);

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 server running on port ${PORT}`);
});