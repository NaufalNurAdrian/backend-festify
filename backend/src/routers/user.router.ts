import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyToken } from "../middleware/verify";
import { uploader } from "../services/uploader";

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/profile", verifyToken, this.userController.getUserId);
    this.router.get("/ticket", verifyToken, this.userController.getTicket);
    this.router.get("/coupon", verifyToken, this.userController.getCoupon);
    this.router.patch(
      "/avatar",
      verifyToken,
      uploader("memoryStorage", "avatar").single("avatar"),
      this.userController.editAvatar
    );
    this.router.post("/verify-forgot", this.userController.verifyForgotPass);

    this.router.patch("/forgot-password", this.userController.editPassword);
    this.router.patch("/usedticket/:transaction_id", this.userController.updateTicket)
    this.router.patch("/:id", this.userController.editUser);
    this.router.delete("/:id", this.userController.deleteUser);
  }

  getRouter(): Router {
    return this.router;
  }
}
