import PasswordResetEmail from "@/emails/password/email-password-reset";
import { resend } from "@/lib/resend";

export const sendEmailPasswordReset = async (
  toName: string,
  toEmail: string,
  url: string,
) => {
  const { error } = await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: toEmail,
    subject: "Password Reset Request",
    react: <PasswordResetEmail toName={toName} url={url} />,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
};
