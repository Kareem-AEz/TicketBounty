import WelcomeEmail from "@/emails/welcome/email-welcome";
import { resend } from "@/lib/resend";

export const sendEmailSignUpWelcome = async (
  toName: string,
  toEmail: string,
) => {
  return await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: toEmail,
    subject: "Welcome to TicketBounty",
    react: <WelcomeEmail toName={toName} />,
  });
};
