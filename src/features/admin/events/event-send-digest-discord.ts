import { inngest } from "@/lib/inngest";
import logger from "@/lib/logger";
import { adminDigestReadyEvent } from "./event-prepare-digest";

export const eventSendAdminDigestToDiscord = inngest.createFunction(
  {
    id: "send-admin-digest-to-discord",
    triggers: [{ event: adminDigestReadyEvent.name }],
  },
  async ({ event }) => {
    const { totalTickets, totalUsers, totalComments } = event.data;
    // TODO: Send digest to Discord
    logger.info(
      `Sending admin digest to Discord: ${JSON.stringify({ totalTickets, totalUsers, totalComments })}`,
    );
  },
);
