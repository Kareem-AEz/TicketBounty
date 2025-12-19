import WelcomeEmail from "@/emails/welcome/email-welcome";
import WelcomeNotVerifiedEmail from "@/emails/welcome/email-welcome-not-verified";
import { resend } from "@/lib/resend";

export const sendEmailSignUpWelcome = async (
  toName: string,
  toEmail: string,
  emailVerified: string | null,
) => {
  const subject = emailVerified
    ? "Welcome to TicketBounty"
    : "Almost there! Complete your TicketBounty registration";

  return await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: toEmail,
    subject,
    react: emailVerified ? (
      <WelcomeEmail toName={toName} />
    ) : (
      <WelcomeNotVerifiedEmail toName={toName} />
    ),
  });
};
