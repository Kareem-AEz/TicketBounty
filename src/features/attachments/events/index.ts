import { eventBulkDeleteAttachments } from "./bulk-delete-attachments.event";
import { eventDeleteAttachment } from "./delete-attachment.event";

export const ATTACHMENTS_EVENTS = [
  eventDeleteAttachment,
  eventBulkDeleteAttachments,
];
