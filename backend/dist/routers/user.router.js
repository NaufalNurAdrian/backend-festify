"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verify_1 = require("../middleware/verify");
const uploader_1 = require("../services/uploader");
class UserRouter {
    constructor() {
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/profile", verify_1.verifyToken, this.userController.getUserId);
        this.router.get("/ticket", verify_1.verifyToken, this.userController.getTicket);
        this.router.get("/coupon", verify_1.verifyToken, this.userController.getCoupon);
        this.router.patch("/avatar", verify_1.verifyToken, (0, uploader_1.uploader)("memoryStorage", "avatar").single("avatar"), this.userController.editAvatar);
        this.router.post("/verify-forgot", this.userController.verifyForgotPass);
        this.router.patch("/forgot-password", this.userController.editPassword);
        this.router.patch("/usedticket/:transaction_id", this.userController.updateTicket);
        this.router.patch("/:id", this.userController.editUser);
        this.router.delete("/:id", this.userController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
