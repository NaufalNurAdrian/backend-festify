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
exports.DashboardController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class DashboardController {
    getEventActive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Ambil user_id dari parameter URL
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(400).send({ error: "Invalid user ID" });
                }
                // Query untuk menghitung jumlah event aktif berdasarkan user
                const activeEvent = yield prisma_1.default.event.count({
                    where: {
                        user_id: userId, // Filter berdasarkan user_id
                        status: "ACTIVE", // Event dengan status ACTIVE
                    },
                });
                // Kirim response hanya sekali
                res.status(200).send({
                    activeEvent,
                });
            }
            catch (error) {
                console.error("Error fetching dashboard stats: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getEventDeactive(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Ambil user_id dari parameter URL
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(400).send({ error: "Invalid user ID" });
                }
                // Query untuk menghitung jumlah event aktif berdasarkan user
                const deactiveEvent = yield prisma_1.default.event.count({
                    where: {
                        user_id: userId, // Filter berdasarkan user_id
                        status: "COMPLETED", // Event dengan status ACTIVE
                    },
                });
                // Kirim response hanya sekali
                res.status(200).send({
                    deactiveEvent,
                });
            }
            catch (error) {
                console.error("Error fetching dashboard stats: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getTotalTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(400).send({ error: "Invalid user ID" });
                }
                // Total transaksi dari transaksi yang dilakukan oleh userId sendiri
                const userOwnTransactions = yield prisma_1.default.transaction.aggregate({
                    _sum: {
                        finalPrice: true,
                    },
                    where: {
                        user_id: userId,
                        paymentStatus: "COMPLETED",
                    },
                });
                // Total transaksi dari transaksi pengguna lain yang membeli tiket event userId
                const eventTransactions = yield prisma_1.default.transaction.aggregate({
                    _sum: {
                        finalPrice: true,
                    },
                    where: {
                        paymentStatus: "COMPLETED",
                        OrderDetail: {
                            some: {
                                ticketId: {
                                    event: {
                                        organizer: {
                                            user_id: userId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                // Hitung total transaksi dari kedua sumber
                const totalTransaction = (((_b = userOwnTransactions._sum) === null || _b === void 0 ? void 0 : _b.finalPrice) || 0) +
                    (((_c = eventTransactions._sum) === null || _c === void 0 ? void 0 : _c.finalPrice) || 0);
                res.status(200).send({
                    totalTransaction,
                });
            }
            catch (error) {
                console.error("Error fetching total transaction: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized: user not logged in" });
                }
                const transactions = yield prisma_1.default.transaction.findMany({
                    where: {
                        paymentStatus: "COMPLETED",
                        OR: [
                            { user_id: userId }, // Pendapatan dari transaksi user sendiri
                            {
                                OrderDetail: {
                                    some: {
                                        ticketId: {
                                            event: {
                                                organizer: {
                                                    user_id: userId, // Pendapatan dari event milik user
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        finalPrice: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerDay = transactions.reduce((acc, transaction) => {
                    const date = transaction.createdAt.toISOString().split("T")[0]; // Ambil bagian tanggal
                    if (!acc[date]) {
                        acc[date] = 0;
                    }
                    acc[date] += transaction.finalPrice || 0; // Tambahkan finalPrice
                    return acc;
                }, {});
                const formattedData = Object.entries(incomePerDay).map(([date, totalIncome]) => ({
                    date,
                    totalIncome,
                }));
                res.status(200).send({ incomePerDay: formattedData });
            }
            catch (error) {
                console.error("Error fetching income per day: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized: user not logged in" });
                }
                const transactions = yield prisma_1.default.transaction.findMany({
                    where: {
                        paymentStatus: "COMPLETED",
                        OR: [
                            { user_id: userId },
                            {
                                OrderDetail: {
                                    some: {
                                        ticketId: {
                                            event: {
                                                organizer: {
                                                    user_id: userId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        finalPrice: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerMonth = transactions.reduce((acc, transaction) => {
                    const month = transaction.createdAt.toISOString().slice(0, 7); // Format YYYY-MM
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += transaction.finalPrice || 0;
                    return acc;
                }, {});
                const formattedIncome = Object.entries(incomePerMonth).map(([month, totalIncome]) => ({
                    month,
                    totalIncome,
                }));
                res.status(200).send({ incomePerMonth: formattedIncome });
            }
            catch (error) {
                console.error("Error fetching income per month: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getIncomePerYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                if (!userId) {
                    res.status(401).send({ message: "Unauthorized: user not logged in" });
                }
                const transactions = yield prisma_1.default.transaction.findMany({
                    where: {
                        paymentStatus: "COMPLETED",
                        OR: [
                            { user_id: userId },
                            {
                                OrderDetail: {
                                    some: {
                                        ticketId: {
                                            event: {
                                                organizer: {
                                                    user_id: userId,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    select: {
                        createdAt: true,
                        finalPrice: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                });
                const incomePerYear = transactions.reduce((acc, transaction) => {
                    const year = transaction.createdAt.toISOString().slice(0, 4); // Format YYYY
                    if (!acc[year]) {
                        acc[year] = 0;
                    }
                    acc[year] += transaction.finalPrice || 0;
                    return acc;
                }, {});
                const formattedIncome = Object.entries(incomePerYear).map(([year, totalIncome]) => ({
                    year,
                    totalIncome,
                }));
                res.status(200).send({ incomePerYear: formattedIncome });
            }
            catch (error) {
                console.error("Error fetching income per year: ", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });
    }
    getAnttendeEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user_id;
                const currentDate = new Date();
                const userOwnAttende = yield prisma_1.default.orderDetail.aggregate({
                    _sum: {
                        qty: true
                    },
                    where: {
                        used: true,
                        transaction: {
                            user_id: userId
                        }
                    }
                });
                const anttendeEvent = yield prisma_1.default.orderDetail.aggregate({
                    _sum: {
                        qty: true
                    },
                    where: {
                        used: true,
                        ticketId: {
                            event: {
                                organizer: {
                                    user_id: userId
                                },
                                endTime: currentDate
                            }
                        }
                    }
                });
                const totalAttendeEvent = (userOwnAttende._sum.qty || 0) + (anttendeEvent._sum.qty || 0);
                res.status(200).send({ message: "success get attende event", totalAttendeEvent });
            }
            catch (error) {
                res.status(400).send({ message: error });
            }
        });
    }
}
exports.DashboardController = DashboardController;
