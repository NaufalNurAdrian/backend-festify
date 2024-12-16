import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AuthRouter } from "./routers/auth.router";
// import path from "path";
import cookieParser from "cookie-parser";
import { UserRouter } from "./routers/user.router";
import { EventRouter } from "./routers/event.router";
import { TicketRouter } from "./routers/ticket.router";

const PORT: number = 8000;

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

// app.use("/api/public", express.static(path.join(__dirname, "../public")));

const authRouter = new AuthRouter();
const userRouter = new UserRouter();
const eventsRouter = new EventRouter();
const ticketRouter = new TicketRouter();

app.use("/api/auth", authRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/event", eventsRouter.getRouter());
app.use("/api/tickets", ticketRouter.getRouter());

app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
