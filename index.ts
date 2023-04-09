import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./src/controllers/userController";
import { getImprovedPrompt } from "./src/services/promptService";
import adminController from "./src/controllers/adminController";
import promptController from "./src/controllers/promptController";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
// use cors package
app.use(cors());

app.use("/user", userController);
app.use("/admin", adminController);
app.use("/prompt", promptController);

app.get("/", (req: Request, res: Response) => {
  res.send("PromptlyLabs api");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

