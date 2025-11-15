import { inngest } from "@/lib/inngest";
import { sendEmailAdminDigest } from "../emails/send-email-admin-digest";

export const eventSendAdminDigestEmail = inngest.createFunction(
  {
    id: "send-admin-digest-email",
  },
  { event: "app/admin-digest.ready" },
  async ({ event }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;
    const response = await sendEmailAdminDigest({
      totalTickets,
      totalUsers,
      totalComments,
    });

    return { event, data: response };
  },
);
