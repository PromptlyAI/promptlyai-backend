import { Request, Response, Router } from "express";
import { getImprovedPrompt } from "../services/openAIService";

const router = Router();

router.get("/get-improved-prompt", async (req: Request, res: Response) => {
    const prompt = req.query.prompt as string;
    const improvedPrompt = await getImprovedPrompt(prompt);
    return res.json(improvedPrompt);
})

export default router;