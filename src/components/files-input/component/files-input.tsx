"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import useFileInputNavigation from "../hooks/use-file-input-navigation";
import useFiles from "../hooks/use-files";
import { ProcessedFileWithPreview } from "../types";
import { fileExtentionFromMime } from "../utils/file-extention-from-mime";

export type FilesInputHandle = {
  reset: () => void;
};

type FilesInputProps = {
  // -- DATA --
  value: File[];
  onChange: (value: File[]) => void;

  //   -- config --
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];

  //   -- UI --
  disabled?: boolean;
  className?: string;

  //   -- REF --
  ref?: React.Ref<{ reset: () => void }>;

  //  -- OPTIONAL: ERROR HANDLING --
  onError?: (errors: { message: string; file: File }[]) => void;
};

export default function FilesInput({
  maxFiles = 5,
  maxSize = 4 * 1024 * 1024, // 4MB
  acceptedTypes = ["image/png", "image/jpeg", "application/pdf"],
  disabled = false,
  onChange,
  onError,
  ref,
}: FilesInputProps) {
  //   -- IMAGE LOADED MAP --
  const [imageLoadedMap, setImageLoadedMap] = useState<Record<string, boolean>>(
    {},
  );

  // -- HANDLER: REMOVE FILE --
  const handleRemove = (file: ProcessedFileWithPreview) => {
    handleRemoveFile(file);
    handleRemoveFileFocus();
  };

  // -- USE FILES HOOK --
  const {
    refs: { dropZoneRef, inputRef },
    handlers: {
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileChange,
      handleRemoveFile,
    },
    actions: { reset },
    state: { processedFilesWithPreviews, isDragging, isMaxFilesReached },
  } = useFiles({
    maxFiles,
    maxSize,
    acceptedTypes,
    disabled,
    onChange,
    onError,
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      reset();
    },
  }));

  // -- USE FILE INPUT NAVIGATION HOOK --
  const {
    state: { activeDeleteIndex },
    handlers: { setActiveDeleteIndex, handleRemoveFileFocus },
    refs: { deleteButtonRefs },
  } = useFileInputNavigation({
    processedFilesWithPreviews,
    dropZoneRef,
  });

  const isDisabled = isMaxFilesReached || disabled;
  const acceptedTypesString = acceptedTypes
    .map((type) => fileExtentionFromMime(type))
    .join(", ");

  return (
    <div className="flex flex-col gap-y-8">
      {/* -- THE FORM CONTAINER -- */}
      {/* -- THE FILES FORM -- */}
      <div className="flex flex-col gap-y-4">
        {/* -- THE DROP ZONE -- */}
        <div className="z-10 flex flex-col items-center gap-y-3">
          <div
            ref={dropZoneRef}
            className={cn(
              "border-muted-foreground/20 bg-card hover:border-primary/40 group/drop-zone hover:bg-muted/10 focus-visible:ring-ring/50 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-y-3 rounded-xl border-2 border-dashed transition-all focus-visible:ring-3 focus-visible:outline-none",
              isDragging && !isDisabled && "border-primary/50 bg-primary/5",
              isDisabled &&
                "hover:border-muted-foreground/20 cursor-not-allowed opacity-50 hover:bg-transparent",
            )}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
              if (
                e.key === "ArrowDown" &&
                processedFilesWithPreviews.length > 0
              ) {
                e.preventDefault();
                setActiveDeleteIndex(0);
                deleteButtonRefs.current[0]?.focus();
              }
            }}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            {/* -- THE HIDDEN FILE INPUT -- */}
            <Input
              className="hidden"
              name="attachment"
              type="file"
              multiple
              accept={acceptedTypesString}
              ref={inputRef}
              onChange={handleFileChange}
              disabled={isDisabled}
            />

            {/* -- THE DROP ZONE LABEL -- */}
            <div className="flex flex-col items-center gap-y-1 text-center">
              <span
                id="attachment-dropzone-label"
                className={cn(
                  "text-muted-foreground/60 group-hover/drop-zone:text-muted-foreground/90 font-mono text-xs tracking-wider transition-colors",
                  isDisabled && "text-muted-foreground/60!",
                )}
              >
                Drop your files here
                <br />
                or{" "}
                <span className="border-muted-foreground/40 border-b-2">
                  click to select
                </span>
              </span>
            </div>
          </div>

          {/* -- THE FILES LIMIT INFO -- */}
          <div className="flex w-full items-center justify-between">
            <p className="text-muted-foreground/60 font-mono text-xs tracking-wider">
              Images & PDF up to {(maxSize / 1024 / 1024).toFixed(0)}
              MB
            </p>

            <div
              // ref={filesLimitInfoRef}
              className="flex items-center gap-x-1 font-mono text-xs tracking-wider"
            >
              <span className="text-muted-foreground">
                {processedFilesWithPreviews.length}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground/60">{maxFiles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* -- THE FILES LIST SEPARATOR -- */}
      {processedFilesWithPreviews.length > 0 && (
        <Separator className="bg-accent" />
      )}

      {/* -- THE FILES LIST -- */}
      {processedFilesWithPreviews.length > 0 && (
        <div role="list" className="flex flex-col gap-y-2 overflow-hidden">
          {processedFilesWithPreviews.map((processedFileWithPreview, index) => (
            <div
              key={processedFileWithPreview.hash}
              role="listitem"
              className="bg-card flex w-full items-center gap-x-3 rounded-lg p-3 transition-colors"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md">
                {processedFileWithPreview.mimeType.startsWith("image/") && (
                  <div className="flex size-10 items-center justify-center">
                    <motion.img
                      key={processedFileWithPreview.hash}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: imageLoadedMap[
                          processedFileWithPreview.objectUrl
                        ]
                          ? 1
                          : 0,
                      }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        bounce: 0.1,
                      }}
                      className="size-10 rounded-md object-cover object-center opacity-80"
                      src={processedFileWithPreview.objectUrl}
                      alt={processedFileWithPreview.file.name}
                      onLoad={() =>
                        setImageLoadedMap((prev) => ({
                          ...prev,
                          [processedFileWithPreview.objectUrl]: true,
                        }))
                      }
                    />
                  </div>
                )}
                {processedFileWithPreview.mimeType.startsWith(
                  "application/pdf",
                ) && (
                  <div className="flex size-10 items-center justify-center">
                    <PdfSvg className="text-foreground/90 size-8 stroke-1" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
                <span className="text-foreground/90 truncate text-sm font-medium">
                  {processedFileWithPreview.file.name}
                </span>
                <span className="text-muted-foreground/60 font-mono text-[10px] uppercase">
                  {processedFileWithPreview.mimeType.split("/")[1]} •{" "}
                  {(processedFileWithPreview.file.size / 1024 / 1024).toFixed(
                    2,
                  )}{" "}
                  MB
                </span>
              </div>

              <Button
                type="button"
                ref={(el) => {
                  deleteButtonRefs.current[index] = el;
                }}
                tabIndex={activeDeleteIndex === index ? 0 : -1}
                aria-label={`Remove ${processedFileWithPreview.file.name}`}
                className="text-muted-foreground/60 hover:text-destructive h-8 w-8 shrink-0 transition-colors focus:opacity-100"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent clicking the card behind it
                  handleRemove(processedFileWithPreview);
                }}
                onFocus={() => setActiveDeleteIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (index < processedFilesWithPreviews.length - 1) {
                      setActiveDeleteIndex(index + 1);
                      deleteButtonRefs.current[index + 1]?.focus();
                    }
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (index > 0) {
                      setActiveDeleteIndex(index - 1);
                      deleteButtonRefs.current[index - 1]?.focus();
                    } else {
                      dropZoneRef.current?.focus();
                    }
                  }
                  if (
                    e.key === "Delete" ||
                    e.key === "Backspace" ||
                    e.key === "Enter"
                  ) {
                    e.preventDefault();
                    handleRemove(processedFileWithPreview);
                  }
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PdfSvg = ({ className }: { className: string }) => (
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
