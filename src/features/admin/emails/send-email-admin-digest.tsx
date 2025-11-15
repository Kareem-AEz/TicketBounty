import AdminDigestEmail from "@/emails/digest/email-admin-digest";
import { resend } from "@/lib/resend";
import { AdminDigestReadyEventData } from "../events/prepare-admin-digest";

export const sendEmailAdminDigest = async ({
  totalTickets,
  totalUsers,
  totalComments,
}: AdminDigestReadyEventData["data"]) => {
  return await resend.emails.send({
    from: "Ticket Bounty <no-reply@app.nab3water.com>",
    to: "kemoahmedahmedkemo@gmail.com",
    subject: "Admin Digest",
    react: (
      <AdminDigestEmail
        totalTickets={totalTickets}
        totalUsers={totalUsers}
        totalComments={totalComments}
      />
    ),
  });
};
