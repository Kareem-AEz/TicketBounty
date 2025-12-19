import EmailVerification from "@/emails/verification/email-verification.email";
import { resend } from "@/lib/resend";

export const sendEmailVerification = async (
  toName: string,
  toEmail: string,
  verificationCode: string,
) => {
  return await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: toEmail,
    subject: "Verify your email",
    react: (
      <EmailVerification
        userName={toName}
        verificationCode={verificationCode}
      />
    ),
  });
};
