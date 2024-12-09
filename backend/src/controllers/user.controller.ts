import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { cloudinaryUpload } from "../services/cloudinary";

export class UserController {
  
  async getUserId(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: req.user?.id },
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
      await prisma.user.update({ data: req.body, where: { user_id: +user_id } });
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
  
  async editAvatarCloud(req: Request, res: Response) {
    try {
      const file = req.file as Express.Multer.File;
      if (file) throw { message: "file empty" };
      const { secure_url } = await cloudinaryUpload(file, "avatar");

      await prisma.user.update({
        data: { avatar: secure_url },
        where: { user_id: req.user?.id },
      });
      res.status(200).send({ message: "avatar edited !" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}