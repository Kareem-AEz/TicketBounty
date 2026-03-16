type GenerateS3KeyParams = {
  organizationId: string;
  ticketId: string;
  attachmentName: string;
  attachmentId: string;
  attachmentHash: string;
};

const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[\/\\:*?"<>|]/g, "_") // Replace problematic chars
    .replace(/\.\./g, "_"); // Prevent path traversal
};

export const generateS3Key = ({
  organizationId,
  ticketId,
  attachmentName,
  attachmentId,
  attachmentHash,
}: GenerateS3KeyParams) => {
  const safeName = sanitizeFilename(attachmentName);
  return `${organizationId}/${ticketId}/${attachmentId}-${attachmentHash}-${safeName}`;
};
