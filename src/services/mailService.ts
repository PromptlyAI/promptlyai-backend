import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import { MailDto, VerifyAccountDto } from "../interfaces/MailDto";

config();

//ÄNDRA SENARE!!!!
export default async function sendVerifyEmail(emailDto: VerifyAccountDto): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const verifyEmailLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailDto.token}`;

  const msg = {
    to: emailDto.to,
    from: "promptlylabs@gmail.com",
    subject: "Verify email",
    text: `Verify Email: ${verifyEmailLink}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          padding: 30px;
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
  
        .verify-link {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0066ff;
          color: #white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Verify your email address</h1>
        <p>Thank you for signing up for PromptlyLabs. To complete the registration process, please click the button below to verify your email address.</p>
        <a class="verify-link" href="${verifyEmailLink}">Verify Email</a>
        <p>If you didn't sign up for this account, please ignore this email. If you have any questions, feel free to contact us at <a href="mailto:promptlylabs@gmail.com">promptlylabs@gmail.com</a>.</p>
      </div>
    </body>
    </html>`,
  };
  

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}
