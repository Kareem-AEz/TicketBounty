import { Attachment } from "@/generated/client";
import AttachmentDeleteButton from "./attachment-delete-button";

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
      <div className="flex min-w-0 items-center gap-x-2">
        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
          <FileIconSvg className="text-foreground/90 size-7 stroke-1" />
        </div>
        <span className="text-foreground/90 truncate text-sm font-medium">
          {attachment.name}
        </span>
      </div>

      <div className="ml-auto">
        <AttachmentDeleteButton attachmentId={attachment.id} />
      </div>
    </div>
  );
}

function FileIconSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M11.9216 2.75H6.75C5.64543 2.75 4.75 3.64543 4.75 4.75V19.25C4.75 20.3546 5.64543 21.25 6.75 21.25H17.25C18.3546 21.25 19.25 20.3546 19.25 19.25V10.0784C19.25 9.54799 19.0393 9.03929 18.6642 8.66421L13.3358 3.33579C12.9607 2.96071 12.452 2.75 11.9216 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 3.25V7.25C12.75 8.35457 13.6454 9.25 14.75 9.25H18.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
