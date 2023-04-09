import { Request, Response, Router } from "express";
import verifyToken from "../middleware/verify";
import {
  getImprovedPrompt,
  getImprovedResult,
  getAllPrompts,
  deletePrompt,
} from "../services/promptController";
import checkBan from "../middleware/checkBan";
import { UUID } from "crypto";

const router = Router();

router.get(
  "/get-improved-prompt",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const improvedPrompt = await getImprovedPrompt(prompt, (req as any).user);
    return res.json(improvedPrompt);
  }
);

router.get(
  "/get-improved-answer",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const promptId = req.query.promptId as string;

    const improvedResult = await getImprovedResult(
      prompt,
      (req as any).userId,
      promptId
    );
    return res.json(improvedResult);
  }
);

router.get(
  "/prompts",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    console.log("getAllPrompts");
    const prompts = await getAllPrompts((req as any).user);
    return res.json(prompts);
  }
);

router.delete(
  "/",
  verifyToken,
  checkBan,
  async (req: Request<{}, {}, UUID>, res: Response) => {
    const prompts = await deletePrompt((req as any).user, req.body);
    return res.json(prompts);
  }
);

export default router;
