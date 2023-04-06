import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";

const checkBan = (req: Request, res: Response, next: NextFunction): void => {
  const user: User = (req as any).user;
  if (user.isBanned) {
    res.status(401).send("User is banned!");
  } else {
    next();
  }
};

export default checkBan;
