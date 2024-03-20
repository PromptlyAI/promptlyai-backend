import { Express, Request, Response } from "express";
import { fetchNewPrompt } from "../services/promptGradService";
import { Router } from "express";
import verifyToken from "../middleware/verify";
import checkBan from "../middleware/checkBan";

const router = Router();

router.post(
  "/optimize",
  verifyToken,
  checkBan,
  (req: Request, res: Response) => {
    const task = req.body.task;
    const trainingData = req.body.trainingData;
    const newPrompt = fetchNewPrompt(task, trainingData);
    return res.json(newPrompt);
  }
);

export default router;
