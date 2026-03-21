import { AttachmentEntity } from "@/generated/enums";

type GenerateS3KeyParams = {
  entity: AttachmentEntity;
  organizationId: string;
  entityId: string;
  attachmentId: string;
  attachmentName: string;
};

const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[\/\\:*?"<>|]/g, "_") // Replace problematic chars
    .replace(/\.\./g, "_"); // Prevent path traversal
};

export const generateS3Key = ({
  entity,
  organizationId,
  entityId,
  attachmentName,
  attachmentId,
}: GenerateS3KeyParams) => {
  const safeName = sanitizeFilename(attachmentName);

  const entityPath = AttachmentEntity[entity].toLowerCase();
  return `${organizationId}/${entityPath}/${entityId}/${attachmentId}-${safeName}`;
};
