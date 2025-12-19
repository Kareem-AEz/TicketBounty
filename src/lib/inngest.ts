import { EventSchemas, Inngest } from "inngest";
import { AdminDigestReadyEventData } from "@/features/admin/events/event-prepare-digest";
import { EmailConfirmationEventData } from "@/features/auth/events/email-confirmation.event";
import { SignedUpWelcomeEmailEventData } from "@/features/auth/events/event-signed-up-welcome-email";
import { PasswordResetEventData } from "@/features/password/events/event-password-reset";
import logger from "./logger";

type Events = {
  "app/password.password-reset-function": PasswordResetEventData;
  "app/auth.signed-up-welcome-email-function": SignedUpWelcomeEmailEventData;
  "app/auth.send-email-verification-code-function": EmailConfirmationEventData;
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
