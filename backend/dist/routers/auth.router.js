"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const verify_1 = require("../middleware/verify");
const user_controller_1 = require("../controllers/user.controller");
class AuthRouter {
    constructor() {
        this.authController = new auth_controller_1.AuthController();
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRouter();
    }
    initializeRouter() {
        this.router.post("/register", this.authController.registerUser);
        this.router.post("/login", this.authController.loginUser);
        this.router.get("/profile", verify_1.verifyToken, this.userController.getUserId);
        this.router.patch("/verify/:token", this.authController.verifyUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
