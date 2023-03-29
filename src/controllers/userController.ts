import { Request, Response, Router } from "express";
import { PrismaClient, User } from "@prisma/client";
import { RegisterDto, UserDto } from "../interfaces/UserDtos";
import { register, login } from "../services/userService";

const prisma = new PrismaClient();
const router = Router();

router.get("/get-user-info", async (req: Request, res: Response) => { });

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      await register(req.body);
      return res.sendStatus(200).send("User created");
    } catch (error) {
      return res.sendStatus(400).send(error);
    }
  }
);

router.post("/login", async (req: Request<{}, {}, UserDto>, res: Response) => {
  try {
    const token = await login(req.body);
    return res.send(token);
  } catch (error) {
    console.log(error)
    return res.status(400).send(error);
  }
});

export default router;
