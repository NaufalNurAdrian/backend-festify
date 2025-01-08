"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRouter = void 0;
const express_1 = require("express");
const order_controllers_1 = require("../controllers/order.controllers");
const verify_1 = require("../middleware/verify");
class TransactionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.transactionController = new order_controllers_1.TransactionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", verify_1.verifyToken, this.transactionController.createTransaction);
        this.router.post("/payment", verify_1.verifyToken, this.transactionController.getSnapToken);
        // Tambahkan route untuk applyCoupon
        this.router.post("/applyCoupon", verify_1.verifyToken, this.transactionController.applyCoupon);
        this.router.post("/applyPoints", verify_1.verifyToken, this.transactionController.applyPoint);
        this.router.post("/midtrans-webhook", this.transactionController.midtransWebhook);
        this.router.get("/:transaction_id", this.transactionController.getTransactionId);
    }
    getRouter() {
        return this.router;
    }
}
exports.TransactionRouter = TransactionRouter;
