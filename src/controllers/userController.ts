import { Request, Response, Router } from "express";
import { PrismaClient, User } from "@prisma/client";
import {
  ForgotPasswordDto,
  RegisterDto,
  ResetPasswordDto,
  UserDto,
} from "../interfaces/UserDtos";
import {
  register,
  login,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "../services/userService";
import verifyToken from "../middleware/verify";
const prisma = new PrismaClient();
const router = Router();

router.get("/get-user-info", async (req: Request, res: Response) => {});

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      await register(req.body);
      return res.send("User created");
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.post("/login", async (req: Request<{}, {}, UserDto>, res: Response) => {
  try {
    const token = await login(req.body);
    return res.send(token);
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

router.delete("/", verifyToken, async (req: Request, res: Response) => {
  try {
    await deleteUser((req as any).userId);
    return res.send("User deleted");
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.post(
  "/forgotPassword",
  async (req: Request<{}, {}, ForgotPasswordDto>, res: Response) => {
    try {
      res.send(await forgotPassword(req.body.email));
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.patch(
  "/resetPassword",
  async (req: Request<{}, {}, ResetPasswordDto>, res: Response) => {
    try {
      await resetPassword(req.body.token, req.body.newPassword);
      res.send("Password has been reset");
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

export default router;
