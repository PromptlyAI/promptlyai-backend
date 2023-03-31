import verifyToken from "../middleware/verify";
import { Request, Response, Router } from "express";
import {
  changeTokenBalance,
  changeUserRole,
  getAllUsers,
  searchUsers,
} from "../services/adminService";
import { UUID } from "crypto";

const router = Router();

router.patch(
  "/changeTokenBalance",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await changeTokenBalance(
        (req as any).userId,
        req.body.userId,
        req.body.balance
      );
      return res.send("Balance changed");
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.patch(
  "/changeUserRole",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await changeUserRole(
        (req as any).userId,
        req.body.userId,
        req.body.newRole
      );
      return res.send("UserRole changed");
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.get("/getAllUsers", verifyToken, async (req: Request, res: Response) => {
  try {
    return res.send(await getAllUsers((req as any).userId));
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get("/searchUsers", verifyToken, async (req: Request, res: Response) => {
  try {
    return res.send(await searchUsers((req as any).userId, req.body.search));
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.patch(
  "/banUser",
  verifyToken,
  async (req: Request, res: Response) => {}
);

export default router;
