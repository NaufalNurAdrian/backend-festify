import "express";

const RoleUser = "ORGANIZER" || "CUSTOMER"

export type UserPayload = {
  user_id: number;
  role: RoleUser;
};

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}