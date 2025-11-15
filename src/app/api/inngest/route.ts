import { serve } from "inngest/next";
import { eventPrepareAdminDigest } from "@/features/admin/events/prepare-admin-digest";
import { eventSendAdminDigestDiscord } from "@/features/admin/events/send-digest-discord";
import { eventSendAdminDigestEmail } from "@/features/admin/events/send-digest-email";
import { eventSignUpWelcomeEmail } from "@/features/auth/events/event-sign-up-welcome-email";
import { eventPasswordReset } from "@/features/password/events/event-password-reset";
import { handleAnyFunctionFailure, inngest } from "@/lib/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleAnyFunctionFailure,
    eventPasswordReset,
    eventSignUpWelcomeEmail,
    eventPrepareAdminDigest,
    eventSendAdminDigestEmail,
    eventSendAdminDigestDiscord,
  ],
});
