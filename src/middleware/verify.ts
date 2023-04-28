import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const bearerHeader = req.headers.authorization;
    console.log(bearerHeader);
    if (bearerHeader) {
      const bearerToken = bearerHeader.split(" ")[1];
      console.log(process.env.TOKEN_SECRET)
      jwt.verify(
        bearerToken,
        process.env.TOKEN_SECRET || "",
        async (err, decodedToken: any) => {
          if (err) {
            console.log(err);
            res.status(401).send("Not logged-in");
          } else {
            const user = await prisma.user.findUnique({
              where: {
                id: decodedToken.id,
              },
            });

            (req as any).user = user;

            next();
          }
        }
      );
    } else {
      res.status(401).send("Not logged-in");
    }
  } catch {
    res.status(500).send("Something went wrong");
  }
};

export default verifyToken;
