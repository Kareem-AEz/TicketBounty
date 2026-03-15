import AttachmentForm from "@/features/attachments/components/attachment-form";

export default function AttachmentFormPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="bg-card w-full max-w-xl rounded-xl p-4">
        <AttachmentForm ticketId="123" />
      </div>
    </div>
  );
}
