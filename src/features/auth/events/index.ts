import { eventEmailConfirmation } from "./email-confirmation.event";
import { eventSignedUpWelcomeEmail } from "./event-signed-up-welcome-email";

export const AUTH_FUNCTIONS = [
  eventSignedUpWelcomeEmail,
  eventEmailConfirmation,
];
