type GenerateS3KeyParams = {
  organizationId: string;
  ticketId: string;
  attachmentName: string;
  attachmentId: string;
};

export const generateS3Key = ({
  organizationId,
  ticketId,
  attachmentName,
  attachmentId,
}: GenerateS3KeyParams) => {
  return `${organizationId}/${ticketId}/${attachmentName}-${attachmentId}`;
};
