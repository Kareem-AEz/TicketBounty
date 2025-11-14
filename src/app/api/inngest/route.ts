import { serve } from "inngest/next";
import { eventPasswordReset } from "@/features/password/events/event-password-reset";
import { handleAnyFunctionFailure, inngest } from "@/lib/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [eventPasswordReset, handleAnyFunctionFailure],
});
