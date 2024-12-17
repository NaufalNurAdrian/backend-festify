import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserPayload } from "../custom";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) throw { message: "Unauthorize!" };
    
    const verifiedUser = verify(token, process.env.JWT_KEY!);
    console.log(verifiedUser);

    req.user = verifiedUser as UserPayload;

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role == "ORGANIZER") {
    next();
  } else {
    res.status(400).send({ message: "Unauthorize, Admin only!" });
  }
};