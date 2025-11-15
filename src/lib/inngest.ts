import { EventSchemas, Inngest } from "inngest";
import { AdminDigestReadyEventData } from "@/features/admin/events/event-prepare-digest";
import { UserSignedUpEventData } from "@/features/auth/events/event-signed-up-welcome-email";
import { PasswordResetRequestedEventData } from "@/features/password/events/event-password-reset";
import logger from "./logger";

type Events = {
  "app/password.reset-requested": PasswordResetRequestedEventData;
  "app/auth.signed-up": UserSignedUpEventData;
  "app/admin.digest-ready": AdminDigestReadyEventData;
};

export const inngest = new Inngest({
  id: "ticket-bounty",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export const handleAnyFunctionFailure = inngest.createFunction(
  { id: "handle-any-fn-failure" },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    await step.run("log-failure", async () => {
      // Also log through pino logger
      logger.error(
        {
          functionId: event.data.function_id,
          runId: event.data.run_id,
          error: event.data.error,
          eventData: event.data,
        },
        "Inngest function failed",
      );
    });
  },
);
