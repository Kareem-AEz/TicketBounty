import { CardCompact } from "@/components/card-compact";
import AttachmentForm from "./attachment-form";

type AttachmentsProps = {
  ticketId: string;
  isOwner: boolean;
};

export default function Attachments({ ticketId, isOwner }: AttachmentsProps) {
  return (
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
  );
}
