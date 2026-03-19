import { CardCompact } from "@/components/card-compact";
import { getAttachments } from "../queries/get-attachments";
import AttachmentForm from "./attachment-form";
import AttachmentItem from "./attachmet-item";

type AttachmentsProps = {
  ticketId: string;
  isOwner: boolean;
};

export default async function Attachments({
  ticketId,
  isOwner,
}: AttachmentsProps) {
  const attachments = await getAttachments(ticketId);
  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="flex flex-col">
        <h4 className="text-lg font-medium">Attachments</h4>
        <p className="text-muted-foreground text-sm">
          Upload and manage attachments for this ticket.
        </p>
      </div>
      <div className="flex flex-col gap-y-2">
        {attachments.map((attachment) => (
          <AttachmentItem key={attachment.id} attachment={attachment} />
        ))}
      </div>
      <CardCompact
        className="w-full"
        title="Attachments"
        description="Upload and manage attachments for this ticket."
        content={
          <>
            {/* TODO: Add attachments list here */}
            {isOwner && <AttachmentForm ticketId={ticketId} />}
          </>
        }
      />
    </div>
  );
}
