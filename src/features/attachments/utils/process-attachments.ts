import { ACCEPTED_ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE } from "../constants";

type ProcessAttachmentsProps = {
  existingAttachments?: File[];
  newAttachments: File[];
};

export const processAttachments = ({
  existingAttachments = [],
  newAttachments,
}: ProcessAttachmentsProps) => {
  const toAdd: File[] = [];
  const errors: { message: string; attachment: File }[] = [];

  for (const attachment of newAttachments) {
    if (!ACCEPTED_ATTACHMENT_TYPES.includes(attachment.type)) {
      errors.push({
        message: `File type ${attachment.type} not supported`,
        attachment,
      });
      continue;
    }
    if (attachment.size > MAX_ATTACHMENT_SIZE) {
      errors.push({
        message: `File ${attachment.name} is too large`,
        attachment,
      });
      continue;
    }
    if (
      existingAttachments.some((a) => a.name === attachment.name) ||
      toAdd.some((a) => a.name === attachment.name)
    ) {
      errors.push({
        message: `File ${attachment.name} already exists`,
        attachment,
      });
      continue;
    }

    toAdd.push(attachment);
  }

  return { toAdd, errors };
};
