"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const verify_1 = require("../middleware/verify");
class DashboardRouter {
    constructor() {
        this.dashboardControlller = new dashboard_controller_1.DashboardController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/payments/total-income/day", verify_1.verifyToken, this.dashboardControlller.getIncomePerDay);
        this.router.get("/payments/total-income/month", verify_1.verifyToken, this.dashboardControlller.getIncomePerMonth);
        this.router.get("/payments/total-income/year", verify_1.verifyToken, this.dashboardControlller.getIncomePerYear);
        this.router.get("/event-active/", verify_1.verifyToken, this.dashboardControlller.getEventActive);
        this.router.get("/event-deactive/", verify_1.verifyToken, this.dashboardControlller.getEventDeactive);
        this.router.get("/event-transaction/", verify_1.verifyToken, this.dashboardControlller.getTotalTransaction);
        this.router.get("/event-attende", verify_1.verifyToken, this.dashboardControlller.getAnttendeEvent);
    }
    getRouter() {
        return this.router;
    }
}
exports.DashboardRouter = DashboardRouter;
