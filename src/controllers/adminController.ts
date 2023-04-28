import verifyToken from "../middleware/verify";
import { Request, Response, Router } from "express";
import {
  banUser,
  changeTokenBalance,
  changeUserRole,
  getAllUsers,
  patchUser,
  searchUsers,
  unbanUser,
} from "../services/adminService";
import { UUID } from "crypto";
import { PatchUserDto } from "../interfaces/UserDtos";

const router = Router();

router.patch(
  "/changeTokenBalance",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await changeTokenBalance(
        (req as any).user,
        req.body.userId,
        req.body.balance
      );
      return res.json("Balance changed");
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
  "/changeUserRole",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await changeUserRole(
        (req as any).user,
        req.body.userId,
        req.body.newRole
      );
      return res.json("UserRole changed");
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

router.get("/getAllUsers", verifyToken, async (req: Request, res: Response) => {
  try {
    return res.json(await getAllUsers((req as any).user));
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});

router.get("/searchUsers", verifyToken, async (req: Request, res: Response) => {
  try {      
    return res.json(await searchUsers((req as any).user, req.query.search as string));
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});

router.patch("/banUser", verifyToken, async (req: Request, res: Response) => {
  try {
    return res.json(await banUser((req as any).user, req.body));
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});

router.patch("/unbanUser", verifyToken, async (req: Request, res: Response) => {
  try {
    return res.json(await unbanUser((req as any).user, req.body.userId));
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message }); // Send the error message to the client
    } else {
      return res.status(400).json({ error: 'An unknown error occurred' }); // Send a generic error message if the error is not an instance of Error
    }
  }
});


router.patch(
  "/user",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const patchUserDto: PatchUserDto = req.body;
      await patchUser((req as any).user, patchUserDto);
      return res.json("User successfully updated");
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
