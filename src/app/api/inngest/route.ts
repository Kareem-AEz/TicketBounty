import { serve } from "inngest/next";
import { ADMIN_FUNCTIONS } from "@/features/admin/events";
import { AUTH_FUNCTIONS } from "@/features/auth/events";
import { INVITATION_EVENTS_FUNCTIONS } from "@/features/invitation/events";
import { PASSWORD_FUNCTIONS } from "@/features/password/events";
import { handleAnyFunctionFailure, inngest } from "@/lib/inngest";

const ALL_FUNCTIONS = [
  handleAnyFunctionFailure,
  ...ADMIN_FUNCTIONS,
  ...AUTH_FUNCTIONS,
  ...PASSWORD_FUNCTIONS,
  ...INVITATION_EVENTS_FUNCTIONS,
];

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: ALL_FUNCTIONS,
});
