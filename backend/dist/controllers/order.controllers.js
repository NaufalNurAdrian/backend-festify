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
exports.TransactionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const midtransClient = require("midtrans-client");
class TransactionController {
    // Membuat transaksi baru
    createTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                const { totalPrice, OrderDetail } = req.body;
                const expiredAt = new Date(new Date().getTime() + 15 * 60000);
                const transactionId = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    // Buat transaksi baru
                    const transaction = yield prisma.transaction.create({
                        data: {
                            user_id: userId,
                            totalPrice,
                            finalPrice: totalPrice, // Harga akhir belum dikurangi diskon
                            expiredAt,
                            coupon_Id: null, // Kupon akan diproses nanti
                        },
                    });
                    // Proses tiap item dalam orderDetail
                    yield Promise.all(OrderDetail.map((item) => __awaiter(this, void 0, void 0, function* () {
                        const ticket = yield prisma.ticket.findUnique({
                            where: { ticket_id: item.ticketId.ticket_id },
                        });
                        if (!ticket) {
                            throw new Error(`Ticket not found with ID: ${item.ticketId.ticket_id}`);
                        }
                        if (item.qty > ticket.seats) {
                            throw new Error(`Insufficient seats for ticket ID: ${item.ticketId.ticket_id}`);
                        }
                        // Buat orderDetail baru
                        yield prisma.orderDetail.create({
                            data: {
                                orderId: transaction.transaction_id,
                                ticket_id: item.ticketId.ticket_id,
                                qty: item.qty,
                                subtotal: item.qty * ticket.price,
                            },
                        });
                        // Kurangi jumlah kursi
                        yield prisma.ticket.update({
                            where: { ticket_id: item.ticketId.ticket_id },
                            data: { seats: { decrement: item.qty } },
                        });
                    })));
                    return transaction.transaction_id;
                }));
                res
                    .status(200)
                    .send({ message: "Transaction created", orderId: transactionId });
            }
            catch (err) {
                console.error(err.message);
                res.status(400).send({
                    message: "Error creating transaction",
                    error: err.message,
                });
            }
        });
    }
    // Mendapatkan detail transaksi berdasarkan ID
    getTransactionId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const transaction = yield prisma_1.default.transaction.findUnique({
                    where: { transaction_id: +req.params.transaction_id },
                    include: {
                        OrderDetail: {
                            select: {
                                qty: true,
                                subtotal: true,
                                ticketId: {
                                    select: {
                                        ticket_id: true,
                                        type: true,
                                        price: true,
                                        seats: true,
                                        event: {
                                            select: {
                                                event_id: true,
                                                title: true,
                                                thumbnail: true,
                                                startTime: true,
                                                endTime: true,
                                                location: true,
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                points: true,
                                coupon: {
                                    select: {
                                        coupon_id: true,
                                        discountAmount: true,
                                        expiresAt: true,
                                        used: true,
                                    },
                                    where: {
                                        used: false,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!transaction) {
                    throw new Error("Transaction not found");
                }
                // Cek apakah kupon valid (belum expired dan belum digunakan)
                const coupon = (_a = transaction.user) === null || _a === void 0 ? void 0 : _a.coupon;
                const validCoupon = coupon && !coupon.used && coupon.expiresAt > new Date()
                    ? {
                        coupon_id: coupon.coupon_id,
                        discountAmount: coupon.discountAmount,
                        expiresAt: coupon.expiresAt,
                    }
                    : null;
                res.status(200).send({
                    result: Object.assign(Object.assign({}, transaction), { discount: validCoupon }),
                });
            }
            catch (err) {
                console.error(err.message);
                res.status(400).send({
                    message: "Error retrieving transaction",
                    error: err.message,
                });
            }
        });
    }
    applyCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transaction_id, coupon_id } = req.body;
                // Convert coupon_id to an integer
                const coupon_id_int = parseInt(coupon_id, 10);
                if (isNaN(coupon_id_int)) {
                    throw new Error("Invalid coupon_id provided");
                }
                const transaction = yield prisma_1.default.transaction.findUnique({
                    where: { transaction_id, user: { coupon: { used: false } } },
                    include: { user: { select: { coupon: true } } },
                });
                if (!transaction)
                    throw new Error("Transaction not found");
                const coupon = yield prisma_1.default.coupon.findUnique({
                    where: { coupon_id: coupon_id_int },
                });
                if (!coupon)
                    throw new Error("Coupon not found");
                if (coupon.used) {
                    // Jika kupon sudah terpakai, tidak menghitung diskon
                    res.status(400).send({
                        message: "Coupon has already been used. No discount applied.",
                        finalPrice: transaction.totalPrice, // Harga tetap tanpa diskon
                    });
                    return;
                }
                if (coupon.expiresAt < new Date())
                    throw new Error("Coupon has expired");
                // Calculate the discount based on percentage
                const discountAmount = (transaction.totalPrice * coupon.discountAmount) / 100;
                const finalPrice = Math.max(transaction.totalPrice - discountAmount, 0);
                yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma.transaction.update({
                        where: { transaction_id },
                        data: { finalPrice, coupon_Id: coupon_id_int },
                    });
                    yield prisma.coupon.update({
                        where: { coupon_id: coupon_id_int },
                        data: { used: true },
                    });
                }));
                res
                    .status(200)
                    .send({ message: "Coupon applied successfully", finalPrice });
            }
            catch (err) {
                console.error(err.message);
                res.status(400).send({
                    message: "Error applying coupon",
                    error: err.message,
                });
            }
        });
    }
    // Mendapatkan token Midtrans Snap
    getSnapToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { orderId } = req.body;
                // Ambil transaksi berdasarkan ID
                const transaction = yield prisma_1.default.transaction.findUnique({
                    where: { transaction_id: orderId },
                    include: {
                        OrderDetail: {
                            include: {
                                ticketId: { select: { type: true } },
                            },
                        },
                        user: {
                            select: {
                                username: true,
                                email: true,
                                phone: true,
                                coupon: {
                                    select: {
                                        discountAmount: true, // Assuming this is percentage-based
                                        expiresAt: true,
                                        used: true, // Tambahkan properti 'used'
                                    },
                                },
                            },
                        },
                    },
                });
                if (!transaction)
                    throw new Error("Transaction not found");
                if (transaction.paymentStatus === "FAILED") {
                    throw new Error("Cannot continue with this transaction as it is marked as failed.");
                }
                // Logika untuk diskon hanya jika kupon valid dan belum digunakan
                const coupon = (_a = transaction.user) === null || _a === void 0 ? void 0 : _a.coupon;
                let discountAmount = 0;
                if (coupon && !coupon.used && coupon.expiresAt > new Date()) {
                    discountAmount = (transaction.totalPrice * coupon.discountAmount) / 100; // Diskon persentase
                }
                const finalPrice = transaction.OrderDetail.reduce((total, detail) => total + detail.subtotal, 0) - discountAmount;
                if (finalPrice <= 0) {
                    throw new Error("Final price cannot be zero or negative.");
                }
                // Format item details untuk Midtrans
                const item_details = transaction.OrderDetail.map((detail) => ({
                    id: detail.ticket_id,
                    price: detail.subtotal / detail.qty,
                    quantity: detail.qty,
                    name: detail.ticketId.type,
                }));
                // Tambahkan item diskon ke dalam item details jika ada
                if (discountAmount > 0) {
                    item_details.push({
                        id: "DISCOUNT",
                        price: -discountAmount, // Harga negatif untuk diskon
                        quantity: 1,
                        name: "Discount",
                    });
                }
                // Buat Snap token menggunakan Midtrans SDK
                const snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: process.env.MID_SERVER_KEY,
                });
                const parameters = {
                    transaction_details: {
                        order_id: orderId.toString(),
                        gross_amount: finalPrice,
                    },
                    customer_details: {
                        first_name: (_b = transaction.user) === null || _b === void 0 ? void 0 : _b.username,
                        email: (_c = transaction.user) === null || _c === void 0 ? void 0 : _c.email,
                        phone: (_d = transaction.user) === null || _d === void 0 ? void 0 : _d.phone,
                    },
                    item_details,
                    expiry: {
                        unit: "minutes",
                        duration: 15,
                    },
                };
                const snapTransaction = yield snap.createTransaction(parameters);
                res.status(200).send({ result: snapTransaction.token });
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: "Failed to create snap token" });
            }
        });
    }
    // Webhook Midtrans untuk memperbarui status transaksi
    midtransWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transaction_status, order_id } = req.body;
                console.log("orderId:", +order_id);
                const newStatus = transaction_status === "settlement"
                    ? "COMPLETED"
                    : transaction_status === "pending"
                        ? "PENDING"
                        : "FAILED";
                if (newStatus === "FAILED") {
                    const orderDetails = yield prisma_1.default.orderDetail.findMany({
                        where: { orderId: +order_id },
                        select: { qty: true, ticket_id: true },
                    });
                    for (const item of orderDetails) {
                        yield prisma_1.default.ticket.update({
                            where: { ticket_id: item.ticket_id },
                            data: { seats: { increment: item.qty } },
                        });
                    }
                }
                yield prisma_1.default.transaction.update({
                    where: { transaction_id: +order_id },
                    data: {
                        paymentStatus: newStatus,
                    },
                });
                res.status(200).send({ message: "Success" });
            }
            catch (err) {
                console.error(err);
                res.status(400).send({ message: "Terjadi kesalahan", error: err });
            }
        });
    }
}
exports.TransactionController = TransactionController;
