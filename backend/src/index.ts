import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AuthRouter } from "./routers/auth.router";
import cookieParser from "cookie-parser";
import { UserRouter } from "./routers/user.router";
import { EventRouter } from "./routers/event.router";

import { TicketRouter } from "./routers/ticket.router";

import { DashboardRouter } from "./routers/dashboard.router";
import { TransactionRouter } from "./routers/order.router";
import { ReviewController } from "./controllers/review.controller";
import { ReviewRouter } from "./routers/review.router";

const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: `${process.env.BASE_URL_FE}`,
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(cookieParser());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

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

app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
