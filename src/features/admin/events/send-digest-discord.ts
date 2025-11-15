import { inngest } from "@/lib/inngest";
import logger from "@/lib/logger";

export const eventSendAdminDigestDiscord = inngest.createFunction(
  {
    id: "send-admin-digest-discord",
  },
  { event: "app/admin-digest.ready" }, // every day at midnight
  async ({ event }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;
    // TODO: Send digest to Discord
    logger.info(
      `Sending admin digest to Discord: ${JSON.stringify({ totalTickets, totalUsers, totalComments })}`,
    );
  },
);
