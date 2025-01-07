import { Router } from "express";
import { TransactionController } from "../controllers/order.controllers";
import { verifyToken } from "../middleware/verify";

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      verifyToken,
      this.transactionController.createTransaction
    );
    this.router.post(
      "/payment",
      verifyToken,
      this.transactionController.getSnapToken
    );
    // Tambahkan route untuk applyCoupon
    this.router.post(
      "/applyCoupon",
      verifyToken,
      this.transactionController.applyCoupon
    );
    this.router.patch("/users/profile/points/update",verifyToken, this.transactionController.updateUserPoints)
    this.router.post(
      "/midtrans-webhook",
      this.transactionController.midtransWebhook
    );
    this.router.get(
      "/:transaction_id", verifyToken,
      this.transactionController.getTransactionId
    );
    
  }

  getRouter(): Router {
    return this.router;
  }
}
