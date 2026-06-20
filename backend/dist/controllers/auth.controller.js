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
exports.AuthController = void 0;
const auth_sevices_1 = require("../services/auth.sevices");
const bcrypt_1 = require("bcrypt");
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const mailer_1 = require("../services/mailer");
const generateReferralCode_1 = require("../utils/generateReferralCode");
const date_fns_1 = require("date-fns");
class AuthController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, confirmPassword, username, email, referralCode } = req.body;
                if (password !== confirmPassword)
                    throw { message: "Password not match!" };
                // Cek apakah username atau email sudah digunakan
                const user = yield (0, auth_sevices_1.findUser)(username, email);
                if (user)
                    throw { message: "Username or email has been used!" };
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashPasword = yield (0, bcrypt_1.hash)(password, salt);
                // Buat data user baru
                const newUserData = {
                    username,
                    email,
                    password: hashPasword,
                    referralCode: (0, generateReferralCode_1.generateReferralCode)(),
                    isVerify: false, // Pastikan user belum diverifikasi
                };
                // Cek jika ada referralCode
                if (referralCode) {
                    const referrer = yield prisma_1.default.user.findUnique({
                        where: { referralCode },
                    });
                    if (!referrer)
                        throw { message: "Invalid referral code!" };
                    // Buat log referral
                    yield prisma_1.default.referralLog.create({
                        data: {
                            pointsAwarded: 10000,
                            expiresAt: (0, date_fns_1.addMonths)(new Date(), 3),
                            used: false,
                            User: { connect: { user_id: referrer.user_id } },
                        },
                    });
                    // Buat kupon untuk pengguna baru (tidak dapat digunakan hingga verifikasi)
                    const coupon = yield prisma_1.default.coupon.create({
                        data: {
                            discountAmount: 10,
                            used: false,
                            expiresAt: (0, date_fns_1.addMonths)(new Date(), 3),
                        },
                    });
                    // Tambahkan referrer dan kupon ke pengguna baru
                    newUserData.coupon_id = coupon.coupon_id;
                    newUserData.referredBy_id = referrer.user_id;
                }
                // Simpan pengguna baru
                const newUser = yield prisma_1.default.user.create({ data: newUserData });
                // Kirim email verifikasi
                const payload = { user_id: newUser.user_id };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "10m" });
                const link = `${process.env.BASE_URL_FE}/verify/${token}`;
                const templatePath = path_1.default.join(__dirname, "../templates", "verify.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({ username, link, referralCode: newUserData.referralCode });
                yield mailer_1.transporter.sendMail({
                    from: "nuradriannaufal@gmail.com",
                    to: email,
                    subject: "Welcome to Festify 🙌",
                    html,
                });
                res.status(201).send({ message: "Register Successfully ✅", newUser });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    verifyUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
                // Ambil data user yang diverifikasi
                const user = yield prisma_1.default.user.findUnique({
                    where: { user_id: verifiedUser.user_id },
                });
                if (!user)
                    throw { message: "User not found!" };
                // Update user menjadi terverifikasi
                yield prisma_1.default.user.update({
                    where: { user_id: user.user_id },
                    data: { isVerify: true },
                });
                // Jika user memiliki referrer, tambahkan poin ke referrer
                if (user.referredBy_id) {
                    const referrer = yield prisma_1.default.user.findUnique({
                        where: { user_id: user.referredBy_id },
                    });
                    if (referrer) {
                        // Tambahkan poin ke referrer
                        yield prisma_1.default.user.update({
                            where: { user_id: referrer.user_id },
                            data: { points: { increment: 10000 } }, // Langsung tambahkan poin
                        });
                    }
                }
                res.status(200).send({ message: "Verify Successfully" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, password } = req.body;
                console.log(req.body);
                const user = yield (0, auth_sevices_1.findUser)(data, data);
                if (!user)
                    throw { message: "Account not found!" };
                if (user.isSuspend)
                    throw { message: "Account Suspended!" };
                if (!user.isVerify)
                    throw { message: "Account Not Verified!" };
                // Validasi password
                const isValidPassword = yield (0, bcrypt_1.compare)(password, user.password);
                if (!isValidPassword) {
                    yield prisma_1.default.user.update({
                        where: { user_id: user.user_id },
                        data: { loginAttempt: { increment: 1 } },
                    });
                    if (user.loginAttempt + 1 >= 3) {
                        yield prisma_1.default.user.update({
                            where: { user_id: user.user_id },
                            data: { isSuspend: true },
                        });
                    }
                    throw { message: "Incorrect password!" };
                }
                // Reset loginAttempt jika berhasil login
                yield prisma_1.default.user.update({
                    where: { user_id: user.user_id },
                    data: { loginAttempt: 0 },
                });
                // Buat token JWT
                if (!process.env.JWT_KEY) {
                    throw new Error("JWT_KEY is not defined in environment variables!");
                }
                const payload = { user_id: user.user_id };
                const token = (0, jsonwebtoken_1.sign)(payload, process.env.JWT_KEY, { expiresIn: "1d" });
                res.status(200).send({
                    message: "Login Successfully ✅",
                    user,
                    token,
                });
            }
            catch (err) {
                console.error(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.AuthController = AuthController;
