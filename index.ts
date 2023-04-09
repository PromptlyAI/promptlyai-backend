import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./src/controllers/userController";
import openAIController from "./src/controllers/openAIController";
import { getImprovedPrompt } from "./src/services/promptController";
import adminController from "./src/controllers/adminController";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
// use cors package
app.use(cors());

app.use("/user", userController);
app.use("/admin", adminController);
app.use("/prompt", openAIController);

app.get("/", (req: Request, res: Response) => {
  res.send("PromptlyLabs api");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

