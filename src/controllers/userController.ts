import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/get-user-info", async (req: Request, res: Response) => {});

router.post("/register", async (req: Request<{}, {}, {name: string, email: string}> , res: Response) => {
  try {
    await prisma.user.create({
      data: {
        name: "Alice",
        email: "alice@prisma.io",
        passwordhash: "slak",
      },
    });
  } catch (error) {}
});

router.post("/login", async (req: Request, res: Response) => {});

export default router;
