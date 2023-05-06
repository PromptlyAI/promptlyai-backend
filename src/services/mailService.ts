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
    html: `<a href="${verifyEmailLink}">Verify Email</a>`,
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
