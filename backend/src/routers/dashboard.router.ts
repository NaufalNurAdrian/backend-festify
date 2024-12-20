import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { verifyToken } from "../middleware/verify";

export class DashboardRouter{
    private dashboardControlller: DashboardController
    private router: Router;

    constructor() {
        this.dashboardControlller = new DashboardController()
        this.router = Router();
        this.initializeRoutes()
    }
    private initializeRoutes() {
        this.router.get("/payments/total-income", this.dashboardControlller.getIncomePerday);
        this.router.get("/event-active/:user_id", this.dashboardControlller.getEventActive)
        this.router.get("/event-deactive/:user_id", this.dashboardControlller.getEventDeactive)
        this.router.get("/event-transaction/:user_id", this.dashboardControlller.getTotalTransaction)
    }
    getRouter(): Router {
        return this.router
    }
}