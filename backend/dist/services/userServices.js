"use strict";
// import { PrismaClient } from '@prisma/client';
// import { generateReferralCode } from '../utils/generateReferralCode';
// const prisma = new PrismaClient();
// export const createUser = async (email: string, username: string, referredByCode?: string) => {
//   const referralCode = generateReferralCode();
//   const defaultPassword = 'default_password'; // Harus dienkripsi dalam produksi
//   const defaultRole = 'CUSTOMER';
//   let referredBy = null;
//   if (referredByCode) {
//     referredBy = await prisma.user.findUnique({
//       where: { referralCode: referredByCode },
//     });
//     if (!referredBy) {
//       throw new Error('Invalid referral code');
//     }
//   }
//   const newUser = await prisma.user.create({
//     data: {
//       username,
//       email,
//       password: defaultPassword, // Harus dienkripsi
//       role: defaultRole,
//       referralCode,
//       referredBy: referredBy
//         ? { connect: { user_id: referredBy.user_id } }
//         : undefined, // Menghubungkan ke user berdasarkan ID
//     },
//   });
//   return newUser;
// };
// export const validateReferralCode = async (referralCode: string) => {
//   const referrer = await prisma.user.findUnique({
//     where: { referralCode },
//   });
//   if (!referrer) {
//     throw new Error('Referral code not found');
//   }
//   return referrer;
// };
