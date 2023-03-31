import { Request, Response, Router } from "express";
import verifyToken from "../middleware/verify";
import { getImprovedPrompt, getImprovedResult } from "../services/openAIService";

const router = Router();

router.get("/get-improved-prompt", verifyToken, async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const improvedPrompt = await getImprovedPrompt(prompt, (req as any).userId);
    return res.json(improvedPrompt);
})

router.get("/get-improved-answer", verifyToken, async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const improvedResult = await getImprovedResult(prompt, (req as any).userId);
    return res.json(improvedResult);
})



export default router;