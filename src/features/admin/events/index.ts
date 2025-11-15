import { eventPrepareAdminDigest } from "./event-prepare-digest";
import { eventSendAdminDigestToDiscord } from "./event-send-digest-discord";
import { eventSendAdminDigestToEmail } from "./event-send-digest-email";

export const ADMIN_FUNCTIONS = [
  eventPrepareAdminDigest,
  eventSendAdminDigestToDiscord,
  eventSendAdminDigestToEmail,
];
