import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import MailDto from "../interfaces/MailDto";

config();

//ÄNDRA SENARE!!!!
export default function sendResetPasswordEmail(emailDto: MailDto): void {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const resetPasswordLink = `URL/resetpassword?token=${emailDto.body}`;

  const msg = {
    to: emailDto.to,
    from: "DoNotReply",
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
