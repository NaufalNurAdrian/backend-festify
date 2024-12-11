import { Request, Response } from "express";
import { findUser } from "../services/auth.sevices";
import { compare, genSalt, hash } from "bcrypt";
import prisma from "../prisma";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "../services/mailer";
import { generateReferralCode } from "../utils/generateReferralCode";
import { addMonths } from "date-fns";

export class AuthController {
  async registerUser(req: Request, res: Response) {
    try {
      const { password, confirmPassword, username, email, referralCode } = req.body;
      if (password != confirmPassword) throw { message: "Password not match!" };

      // Cek apakah username atau email sudah digunakan
      const user = await findUser(username, email);
      if (user) throw { message: "Username or email has been used!" };

      const salt = await genSalt(10);
      const hashPasword = await hash(password, salt);

      // Buat data user baru
      const newUserData: any = {
        username,
        email,
        password: hashPasword,
        referralCode: generateReferralCode(),
      };

      // Cek jika ada referralCode
      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (!referrer) throw { message: "Invalid referral code!" };

        // Tambahkan points kepada pengguna yang membagikan kode referral
        await prisma.user.update({
          where: { user_id: referrer.user_id },
          data: { points: { increment: 10000 } },
        });

        // Buat kupon untuk pengguna baru
        const coupon = await prisma.coupon.create({
          data: {
            discountAmount: 10,
            used: false,
            expiresAt: addMonths(new Date(), 3), // Kupon berlaku 1 bulan
          },
        });

        // Tambahkan kupon dan referral info ke pengguna baru
        newUserData.coupon_id = coupon.coupon_id;
        newUserData.referredBy_id = referrer.user_id;

        // Buat log referral
        await prisma.referralLog.create({
          data: {
            pointsAwarded: 10000,
            expiresAt: addMonths(new Date(), 3),
            used: false,
            User: {
              connect: [{ user_id: referrer.user_id }, { user_id: referrer.user_id }],
            },
          },
        });
      }

      // Simpan pengguna baru
      const newUser = await prisma.user.create({ data: newUserData });

      // Kirim email verifikasi
      const payload = { id: newUser.user_id, role: newUser.role };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
      const link = `http://localhost:3000/${token}`;

      const templatePath = path.join(__dirname, "../templates", "verify.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({ username, link, referralCode: newUser });

      await transporter.sendMail({
        from: "nuradriannaufal@gmail.com",
        to: email,
        subject: "Welcome to Festify 🙌",
        html,
      });

      res.status(201).send({ message: "Register Successfully ✅", newUser });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  
  async loginUser(req: Request, res: Response) {
    try {
      const { data, password } = req.body;

      const user = await findUser(data, data);
      if (!user) throw { message: "Account not found!" };
      if (user.isSuspend) throw { message: "Account Suspended!" };
      if (!user.isVerify) throw { message: "Account Not Verified!" };

      // Validasi password
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        await prisma.user.update({
          where: { user_id: user.user_id },
          data: { loginAttempt: { increment: 1 } },
        });

        if (user.loginAttempt + 1 >= 3) {
          await prisma.user.update({
            where: { user_id: user.user_id },
            data: { isSuspend: true },
          });
        }

        throw { message: "Incorrect password!" };
      }

      // Reset loginAttempt jika berhasil login
      await prisma.user.update({
        where: { user_id: user.user_id },
        data: { loginAttempt: 0 },
      });

      // Buat token JWT
      if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY is not defined in environment variables!");
      }
      const payload = { id: user.user_id, role: user.role };
      const token = sign(payload, process.env.JWT_KEY, { expiresIn: "1d" });

      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 3600 * 1000,
          path: "/dashboard",
          secure: process.env.NODE_ENV === "production",
        })
        .send({
          message: "Login Successfully ✅",
          user,
        });
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  }
}