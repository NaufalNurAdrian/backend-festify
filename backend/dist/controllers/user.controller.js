"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const cloudinary_1 = require("../services/cloudinary");
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const mailer_1 = require("../services/mailer");
const auth_sevices_1 = require("../services/auth.sevices");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    getUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield prisma_1.default.user.findUnique({
                    where: { user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id },
                });
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.params;
                yield prisma_1.default.user.update({
                    data: req.body,
                    where: { user_id: +user_id },
                });
                res.status(200).send("User updated ✅");
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.params;
                yield prisma_1.default.user.delete({ where: { user_id: +user_id } });
                res.status(200).send("User deleted ✅");
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    editAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const file = req.file;
                if (!file)
                    throw { message: "file empty" };
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(file, "avatar");
                yield prisma_1.default.user.update({
                    data: { avatar: secure_url },
                    where: { user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id },
                });
                res.status(200).send({ message: "avatar edited !" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    verifyForgotPass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                // Cari user berdasarkan email
                const user = yield (0, auth_sevices_1.findUser)(data, data);
                if (!user) {
                    res.status(400).send({ message: "User not found" }); // Beri return untuk menghentikan eksekusi
                }
                const payload = { user_id: user.user_id, email: user.email };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1h" }); // Masa berlaku 1 jam
                const link = `${process.env.BASE_URL_FE}/reset-password/${token}`; // Ubah link menjadi reset-password
                // Path template email
                const templatePath = path_1.default.join(__dirname, "../templates", "forgotpass.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                // Isi template dengan data user
                const html = compiledTemplate({ username: user.username, link });
                // Kirim email
                yield mailer_1.transporter.sendMail({
                    from: "nuradriannaufal@gmail.com",
                    to: user.email,
                    subject: "Forgot Password Request",
                    html,
                });
                res.status(200).send({ message: "Email sent successfully" });
            }
            catch (error) {
                console.error("Error in verifyForgotPass:", error); // Log error lebih spesifik
                res.status(400).send({ message: "Failed to send forgot password email" });
            }
        });
    }
    editPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                // Verifikasi token JWT
                const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                // Hash password baru sebelum menyimpannya
                const saltRounds = 10;
                const salt = yield bcrypt_1.default.genSalt(saltRounds);
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
                // Update password user
                yield prisma_1.default.user.update({
                    data: { password: hashedPassword },
                    where: { user_id: verifiedUser.user_id },
                });
                res.status(200).send({ message: "Password changed successfully" });
            }
            catch (error) {
                console.log(error);
                res.status(400).send({ message: "Failed to change password" });
            }
        });
    }
    getTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
                }
                const tickets = yield prisma_1.default.orderDetail.findMany({
                    where: {
                        transaction: {
                            user_id: userId,
                            paymentStatus: "COMPLETED",
                        },
                    },
                    select: {
                        orderId: true,
                        subtotal: true,
                        qty: true,
                        transaction: {
                            select: {
                                finalPrice: true,
                                transactionDate: true,
                                expiredAt: true,
                            },
                        },
                        ticketId: {
                            select: {
                                event: {
                                    select: {
                                        event_id: true,
                                        title: true,
                                        location: true,
                                        startTime: true,
                                        endTime: true,
                                    },
                                },
                                type: true,
                            },
                        },
                    },
                });
                res.status(200).send({ message: "get ticket successfully", tickets });
            }
            catch (error) {
                res.status(400).send({ message: "cannot get ticket" });
            }
        });
    }
    getCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized, login first" });
                }
                const coupon = yield prisma_1.default.coupon.findFirst({
                    where: {
                        User: {
                            every: {
                                user_id: userId,
                            },
                        },
                        used: false,
                    },
                    select: {
                        discountAmount: true,
                        expiresAt: true,
                    },
                });
                res.status(200).send({ coupon });
            }
            catch (error) {
                console.log(error);
                res.status(400).send({ message: "cannot get coupon" });
            }
        });
    }
}
exports.UserController = UserController;
