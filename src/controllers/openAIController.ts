import { Request, Response, Router } from "express";
import verifyToken from "../middleware/verify";
import { getImprovedPrompt, getImprovedResult, getAllPrompts } from "../services/openAIService";

const router = Router();

router.get("/get-improved-prompt", verifyToken, async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const improvedPrompt = await getImprovedPrompt(prompt, (req as any).userId);
    return res.json(improvedPrompt);


})

router.get("/get-improved-answer", verifyToken, async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const promptId = req.query.promptId as string;


    const improvedResult = await getImprovedResult(prompt, (req as any).userId, promptId);
    return res.json(improvedResult);
})

router.get("/prompts", verifyToken, async (req: Request, res: Response) => {
    const prompts = await getAllPrompts((req as any).userId);
    return res.json(prompts);
})

export default router;