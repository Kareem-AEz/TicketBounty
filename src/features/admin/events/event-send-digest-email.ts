import { inngest } from "@/lib/inngest";
import { sendEmailAdminDigest } from "../emails/send-email-admin-digest";
import { adminDigestReadyEvent } from "./event-prepare-digest";

export const eventSendAdminDigestToEmail = inngest.createFunction(
  {
    id: "send-admin-digest-to-email",
    triggers: [{ event: adminDigestReadyEvent.name }],
  },
  async ({ event, step }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;

    const response = await step.run("send-email-admin-digest", async () => {
      return await sendEmailAdminDigest({
        totalTickets,
        totalUsers,
        totalComments,
      });
    });

    return { event, data: response };
  },
);
