import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { verifyToken } from "../middleware/verify";

export class DashboardRouter {
  private dashboardControlller: DashboardController;
  private router: Router;

  constructor() {
    this.dashboardControlller = new DashboardController();
    this.router = Router();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      "/payments/total-income/day",
      verifyToken,
      this.dashboardControlller.getIncomePerday
    );
    this.router.get(
      "/payments/total-income/month",
      verifyToken,
      this.dashboardControlller.getIncomePerMonth
    );
    this.router.get(
      "/payments/total-income/year",
      verifyToken,
      this.dashboardControlller.getIncomePerYear
    );
    this.router.get(
      "/event-active/",
      verifyToken,
      this.dashboardControlller.getEventActive
    );
    this.router.get(
      "/event-deactive/",
      verifyToken,
      this.dashboardControlller.getEventDeactive
    );
    this.router.get(
      "/event-transaction/",
      verifyToken,
      this.dashboardControlller.getTotalTransaction
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
