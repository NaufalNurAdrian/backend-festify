import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verify";
import { UserController } from "../controllers/user.controller"

export class AuthRouter{
    private authController: AuthController;
    private userController: UserController
    private router: Router;

    constructor() {
        this.authController = new AuthController
        this.userController = new UserController
        this.router = Router();
        this.initializeRouter();
    }
    private initializeRouter() {
        this.router.post("/register", this.authController.registerUser);
        this.router.post("/login", this.authController.loginUser);
        this.router.get("/profile", verifyToken, this.userController.getUserId)

        this.router.patch("/verify/:token", this.authController.verifyUser)
    }
    getRouter(): Router {
        return this.router
    }
}