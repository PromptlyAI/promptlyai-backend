import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./src/controllers/userController";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/user", userController);

app.get("/", (req: Request, res: Response) => {
  res.send("Slaktar Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

