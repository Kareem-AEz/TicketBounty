import { FileIcon } from "lucide-react";
import { Attachment } from "@/generated/client";

type AttachmentItemProps = {
  attachment: Attachment;
};

export default function AttachmentItem({ attachment }: AttachmentItemProps) {
  return (
    <div
      className="bg-card flex w-full items-center gap-x-3 rounded-lg p-3"
      style={{
        boxShadow: "0 0 0.5px 1px var(--border)",
      }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md">
        <FileIcon className="text-foreground/90 size-8 stroke-1" />
      </div>
      <span className="text-foreground/90 truncate text-sm font-medium">
        {attachment.name}
      </span>
    </div>
  );
}
