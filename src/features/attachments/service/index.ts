import {
  createAttachments,
  uploadAttachments,
} from "./create-attachments";
import { getAttachmentSubject } from "./get-attachment-subject";

export const attachmentsService = {
  uploadAttachments,
  createAttachments,
  getAttachmentSubject,
};
