import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { verifyToken } from "../middleware/verify";

export class ReviewRouter {
  private reviewController: ReviewController;
  private router: Router;

  constructor() {
    this.reviewController = new ReviewController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:eventId", verifyToken, this.reviewController.addRating);
    this.router.get("/:eventId", this.reviewController.getReviews);
  }

  getRouter(): Router {
    return this.router;
  }
}
