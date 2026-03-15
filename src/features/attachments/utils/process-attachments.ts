import { fileTypeFromBuffer } from "file-type";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE,
} from "../constants";

type ProcessAttachmentsProps = {
  existingAttachments?: File[];
  newAttachments: File[];
};

export type ProcessedAttachment = {
  file: File;
  buffer: Buffer;
  mimeType: string;
};

export const processAttachments = async ({
  existingAttachments = [],
  newAttachments,
}: ProcessAttachmentsProps) => {
  const toAdd: ProcessedAttachment[] = [];
  const errors: { message: string; attachment: File }[] = [];

  // -- PROCESS ATTACHMENTS --
  for (const attachment of newAttachments) {
    const ArrayBuffer = await attachment.arrayBuffer();
    const buffer = Buffer.from(ArrayBuffer);
    const type = await fileTypeFromBuffer(buffer);
    const mimeType = type?.mime ?? undefined;

    // -- FILE  TYPE MATCH CHECK --
    if (mimeType !== attachment.type) {
      errors.push({
        message: `File ${attachment.name} type mismatch`,
        attachment,
      });
      continue;
    }

    // -- MAX ATTACHMENT COUNT CHECK --
    if (toAdd.length >= MAX_ATTACHMENT_COUNT) {
      errors.push({
        message: `Maximum number of attachments (${MAX_ATTACHMENT_COUNT}) reached`,
        attachment,
      });
      break;
    }
    // -- ACCEPTED ATTACHMENT TYPES CHECK --
    if (!ACCEPTED_ATTACHMENT_TYPES.includes(mimeType ?? "")) {
      errors.push({
        message: `File ${attachment.name} is not a supported type`,
        attachment,
      });
      continue;
    }

    // -- SIZE CHECK --
    if (attachment.size > MAX_ATTACHMENT_SIZE) {
      errors.push({
        message: `File ${attachment.name} is too large`,
        attachment,
      });
      continue;
    }

    // -- DUPLICATE CHECK --
    if (
      existingAttachments.some((a) => a.name === attachment.name) ||
      toAdd.some((a) => a.file?.name === attachment.name)
    ) {
      errors.push({
        message: `File ${attachment.name} already exists`,
        attachment,
      });
      continue;
    }

    toAdd.push({
      file: attachment,
      buffer,
      mimeType,
    });
  }

  return { toAdd, errors };
};
