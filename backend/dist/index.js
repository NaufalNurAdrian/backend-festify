"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = require("./routers/auth.router");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_router_1 = require("./routers/user.router");
const event_router_1 = require("./routers/event.router");
const ticket_router_1 = require("./routers/ticket.router");
const dashboard_router_1 = require("./routers/dashboard.router");
const order_router_1 = require("./routers/order.router");
const review_router_1 = require("./routers/review.router");
const PORT = 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://frontend-festify.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use((0, cookie_parser_1.default)());
app.get("/api", (req, res) => {
    res.status(200).send("Welcome to my API");
});
const authRouter = new auth_router_1.AuthRouter();
const userRouter = new user_router_1.UserRouter();
const eventsRouter = new event_router_1.EventRouter();
const ticketRouter = new ticket_router_1.TicketRouter();
const transactionRouter = new order_router_1.TransactionRouter();
const dashboardRouter = new dashboard_router_1.DashboardRouter();
const reviewRouter = new review_router_1.ReviewRouter();
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
