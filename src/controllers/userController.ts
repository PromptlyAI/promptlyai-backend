import { Request, Response, Router } from "express";
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
  verifyAccount
} from "../services/userService";
import verifyToken from "../middleware/verify";
const router = Router();

router.get(
  "/get-user-info",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      res.json({
        name: user.name,
        email: user.email,
        totalTokenBalance: user.totalTokenBalance,
        totalImageBalance: user.totalImageBalance,
        role: user.role,
        createdAt: user.createdAt,
        isBanned: user.isBanned,
        banExpirationDate: user.banExpirationDate,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message }); // Send the error message to the client
      } else {
        return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
      }
    }
  }
);

router.put("/verify", async (req: Request, res: Response) => {
  try {
    const isVerified = await verifyAccount(req.body.token)
    if (isVerified) {
      res.status(200).send("Account verified")
    }
  } catch (error) {
    res.status(500).json({ error })
  }
})

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterDto>, res: Response) => {
    try {
      await register(req.body);
      return res.json("User created");
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message }); // Send the error message to the client
      } else {
        return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
      }
    }
  }
);

router.post("/login", async (req: Request<{}, {}, UserDto>, res: Response) => {
  try {
    const token = await login(req.body);
    return res.json(token);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});

router.delete("/", verifyToken, async (req: Request, res: Response) => {
  try {
    await deleteUser((req as any).user);
    return res.json("User deleted");
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});

router.post(
  "/forgotPassword",
  async (req: Request<{}, {}, ForgotPasswordDto>, res: Response) => {
    try {
      res.json(await forgotPassword(req.body.email));
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message }); // Send the error message to the client
      } else {
        return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
      }
    }
  }
);

router.patch(
  "/resetPassword",
  async (req: Request<{}, {}, ResetPasswordDto>, res: Response) => {
    try {
      await resetPassword(req.body.token, req.body.newPassword);
      res.json("Password has been reset");
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message }); // Send the error message to the client
      } else {
        return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
      }
    }
  }
);


export default router;
