import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./src/controllers/userController";
import { getImprovedPrompt } from "./src/services/promptService";
import adminController from "./src/controllers/adminController";
import promptController from "./src/controllers/promptController";
import cors from "cors";
import sgMail from '@sendgrid/mail'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

app.use(express.json());
// use cors package
app.use(cors());

app.use("/user", userController);
app.use("/admin", adminController);
app.use("/prompt", promptController);

app.get("/", (req: Request, res: Response) => {
  res.send("PromptlyLabs api");
});

app.post("/mail", async (req: Request, res: Response) => {
  const msg = {
    to: 'alexanderjernstrom@gmail.com', // Change to your recipient
    from: 'promptlylabs@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response)
      res.send("Success")
    })
    .catch((error) => {
      console.error(error)
      res.send(error)
    })
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

});

