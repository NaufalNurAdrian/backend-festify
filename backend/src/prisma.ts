import { PrismaClient } from "../prisma/generated/client";

export default new PrismaClient({ log: ["query", "warn", "info", "error"] })
