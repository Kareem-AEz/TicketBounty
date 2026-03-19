import { Inngest } from "inngest";
import logger from "./logger";

export const inngest = new Inngest({
  id: "ticket-bounty",
});

export const handleAnyFunctionFailure = inngest.createFunction(
  {
    id: "handle-any-fn-failure",
    triggers: [{ event: "inngest/function.failed" }],
  },
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
