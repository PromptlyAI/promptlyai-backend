import { Request, Response, Router } from "express";
import verifyToken from "../middleware/verify";
import {
  getImprovedPrompt,
  getImprovedResult,
  getAllPrompts,
  deletePrompt,
  getPromptInfo,
  deleteAllMyPrompts,
  getImprovedImagePrompt,
  getImprovedImage,
} from "../services/promptService";
import checkBan from "../middleware/checkBan";
import { UUID } from "crypto";

const router = Router();

router.get(
  "/get-improved-prompt",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      const prompt = req.query.prompt as string;
      const improvedPrompt = await getImprovedPrompt(prompt, (req as any).user);
      return res.json(improvedPrompt);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.get(
  "/get-improved-image-prompt",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      const prompt = req.query.prompt as string;
      const improvedPrompt = await getImprovedImagePrompt(prompt, (req as any).user);
      return res.json(improvedPrompt);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.get(
  "/get-improved-answer",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      const prompt = req.query.prompt as string;
      const promptId = req.query.promptId as string;

      const improvedResult = await getImprovedResult(
        prompt,
        (req as any).user,
        promptId
      );
      return res.json(improvedResult);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.get(
  "/get-improved-image",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      const prompt = req.query.prompt as string;
      const promptId = req.query.promptId as string;

      const improvedResult = await getImprovedImage(
        prompt,
        (req as any).user,
        promptId
      );
      return res.json(improvedResult);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.get(
  "/get-prompt-info",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      console.log("getAllPrompts");
      const prompt = await getPromptInfo(
        (req as any).user,
        req.query.promptId as string
      );
      return res.json(prompt);
    } catch (error) {
      console.log(error)
      return res.status(400).send(error);
    }
  }
);

router.get(
  "/prompts",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      console.log("getAllPrompts");
      const prompts = await getAllPrompts((req as any).user);
      return res.json(prompts);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.delete(
  "/",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      const prompts = await deletePrompt((req as any).user, req.body.promptId);
      return res.json(prompts);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);

router.delete(
  "/all",
  verifyToken,
  checkBan,
  async (req: Request, res: Response) => {
    try {
      await deleteAllMyPrompts((req as any).user);
      return res.json({ message: "All prompts and their answers deleted successfully." });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
);


export default router;
