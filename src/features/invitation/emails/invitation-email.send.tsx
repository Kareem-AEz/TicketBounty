import InvitationEmail from "@/emails/invitations/invitation-email.email";
import { resend } from "@/lib/resend";

interface SendInvitationEmailProps {
  invitationLink: string;
  organizationName: string;
  inviterName: string;
  toEmail: string;
}

export const sendInvitationEmail = async ({
  invitationLink,
  organizationName,
  inviterName,
  toEmail,
}: SendInvitationEmailProps) => {
  return await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: toEmail,
    subject: "Invitation to join " + organizationName,
    react: (
      <InvitationEmail
        organizationName={organizationName}
        inviterName={inviterName}
        invitationLink={invitationLink}
      />
    ),
  });
};
