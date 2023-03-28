import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import Bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { RegisterDto, UserDto } from "../interfaces/UserDtos";
import { register, login } from "../services/UserService";

const prisma = new PrismaClient();
const router = Router();

router.get("/get-user-info", async (req: Request, res: Response) => {});

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      await register(req.body);
      return res.status(200).send("User created");
    } catch (error) {
      res.sendStatus(400).send(error);
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
  try {
    const token = await login(req.body);
    return res.status(200).send(token);
  } catch (error) {
    res.sendStatus(400).send(error);
  }
});

export default router;
