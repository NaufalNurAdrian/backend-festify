import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { cloudinaryUpload } from "../services/cloudinary";
import { sign, verify } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "../services/mailer";
import { genSalt, hash } from "bcrypt";
import { findUser } from "../services/auth.sevices";
import bcrypt from "bcrypt";

export class UserController {
  async getUserId(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: req.user?.user_id },
      });
      res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async editUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      await prisma.user.update({
        data: req.body,
        where: { user_id: +user_id },
      });
      res.status(200).send("User updated ✅");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
  async deleteUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      await prisma.user.delete({ where: { user_id: +user_id } });
      res.status(200).send("User deleted ✅");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async editAvatar(req: Request, res: Response) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) throw { message: "file empty" };
      const { secure_url } = await cloudinaryUpload(file, "avatar");

      await prisma.user.update({
        data: { avatar: secure_url },
        where: { user_id: req.user?.user_id },
      });
      res.status(200).send({ message: "avatar edited !" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async verifyForgotPass(req: Request, res: Response) {
    try {
      const { data } = req.body;
  
      // Cari user berdasarkan email
      const user = await findUser(data, data);
      if (!user) {
        res.status(400).send({ message: "User not found" }); // Beri return untuk menghentikan eksekusi
      }
  
      const payload = { user_id: user!.user_id, email: user!.email };
      const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1h" }); // Masa berlaku 1 jam
      const link = `http://localhost:3000/reset-password/${token}`; // Ubah link menjadi reset-password
  
      // Path template email
      const templatePath = path.join(__dirname, "../templates", "forgotpass.hbs");
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
  
      // Isi template dengan data user
      const html = compiledTemplate({ username: user!.username, link });
  
      // Kirim email
      await transporter.sendMail({
        from: "nuradriannaufal@gmail.com",
        to: user!.email, // Pastikan menggunakan user.email
        subject: "Forgot Password Request",
        html,
      });
  
      res.status(200).send({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error in verifyForgotPass:", error); // Log error lebih spesifik
      res.status(400).send({ message: "Failed to send forgot password email" });
    }
  }
  
  

  async editPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      // Verifikasi token JWT
      const verifiedUser: any = verify(token, process.env.JWT_KEY!);
  
      // Hash password baru sebelum menyimpannya
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update password user
      await prisma.user.update({
        data: { password: hashedPassword },
        where: { user_id: verifiedUser.user_id },
      });
  
      res.status(200).send({ message: "Password changed successfully" });
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Failed to change password" });
    }
  }
  
}
