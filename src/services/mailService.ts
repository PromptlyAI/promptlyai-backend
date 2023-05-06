import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import { MailDto, VerifyAccountDto } from "../interfaces/MailDto";

config();

//ÄNDRA SENARE!!!!
export async function sendVerifyEmail(
  emailDto: VerifyAccountDto
): Promise<void> {
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

export async function sendResetPassword(
  emailDto: VerifyAccountDto
): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${emailDto.token}`;

  const msg = {
    to: emailDto.to,
    from: "promptlylabs@gmail.com",
    subject: "Reset Password",
    text: `Reset Password: ${resetPasswordLink}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 10px;
        }
        a {
          color: #337ab7;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          background-color: #337ab7;
          color: #fff;
          padding: 12px 24px;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          border-radius: 4px;
        }
        .button:hover {
          background-color: #286090;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset Request</h1>
        <p>Dear user,</p>
        <p>We have received a request to reset your password. To proceed with the password reset, please click the button below:</p>
        <p><a href="${resetPasswordLink}" class="button">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.</p>
        <p>Thank you,</p>
        <p>YourWebsite Team</p>
      </div>
    </body>
    </html>
    `,
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
