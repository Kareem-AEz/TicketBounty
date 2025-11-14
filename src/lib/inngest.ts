import { EventSchemas, Inngest } from "inngest";
import { PasswordResetFunctionData } from "@/features/password/events/event-password-reset";
import logger from "./logger";

type Events = {
  "app/password.password-reset-function": PasswordResetFunctionData;
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
