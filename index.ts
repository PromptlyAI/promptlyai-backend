import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./src/controllers/userController";
import openAIController from "./src/controllers/openAIController";
import { getImprovedPrompt } from "./src/services/openAIService";
import adminController from "./src/controllers/adminController";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/user", userController);
app.use("/admin", adminController);
app.use("/openAI", openAIController);

app.get("/", (req: Request, res: Response) => {
  res.send("Slaktar Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

