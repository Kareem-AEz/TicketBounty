"use client";

import { useState } from "react";
import { Attachment } from "@/generated/client";
import { cn } from "@/lib/utils";
import { attachmentDownloadPath, attachmentPreviewPath } from "@/paths";
import AttachmentDeleteButton from "./attachment-delete-button";

type AttachmentItemProps = {
  attachment: Attachment;
};

export default function AttachmentItem({ attachment }: AttachmentItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isImage = attachment.mimeType.startsWith("image/");
  const previewApiUrl = attachmentPreviewPath(attachment.id);
  const downloadApiUrl = attachmentDownloadPath(attachment.id);

  return (
    <div
      className="bg-card flex w-full items-center gap-x-4 rounded-lg p-3"
      style={{
        boxShadow: "0 0 0.5px 1px var(--border)",
      }}
    >
      <a
        href={downloadApiUrl}
        rel="noopener noreferrer "
        target="_blank"
        download={attachment.name}
        className="flex min-w-0 items-center gap-x-2"
      >
        <div
          className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md"
          aria-hidden="true"
        >
          {isImage ? (
            <img
              onLoad={() => setIsLoaded(true)}
              src={previewApiUrl}
              alt={attachment.name}
              className={cn(
                "size-full object-cover opacity-0 transition-opacity duration-[.8s]",
                isLoaded && "opacity-100",
              )}
            />
          ) : (
            <FileIconSvg className="text-foreground/90 size-7 stroke-1" />
          )}
        </div>
        <span className="text-foreground/90 truncate text-sm font-medium">
          {attachment.name}
        </span>
      </a>

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
        d="M4.75 11.25V5.75C4.75 4.64543 5.64543 3.75 6.75 3.75H14.1716C14.702 3.75 15.2107 3.96071 15.5858 4.33579L18.6642 7.41421C19.0393 7.78929 19.25 8.29799 19.25 8.82843V11.25M13.75 4.25V7.25C13.75 8.35457 14.6454 9.25 15.75 9.25H18.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 20.25V14.75H5.75C6.57843 14.75 7.25 15.4216 7.25 16.25C7.25 17.0784 6.57843 17.75 5.75 17.75H4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 14.75V20.25H11.25C12.3333 20.25 14 19.7 14 17.5C14 15.3 12.3333 14.75 11.25 14.75H9.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.25 14.75H16.75V20.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.75 17.75H19.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
