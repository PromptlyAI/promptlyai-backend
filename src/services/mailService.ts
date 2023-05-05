import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import { MailDto, VerifyAccountDto } from "../interfaces/MailDto";

config();

//ÄNDRA SENARE!!!!
export default async function sendVerifyEmail(emailDto: VerifyAccountDto): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const resetPasswordLink = `${process.env.FRONTEND_URL}/verify?token=${emailDto.token}`;

  const msg = {
    to: emailDto.to,
    from: "promptlylabs@gmail.com",
    subject: "Reset password",
    text: `Reset password: ${resetPasswordLink}`,
    html: `<a href="${resetPasswordLink}">Reset password</a>`,
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
