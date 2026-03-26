import { useEffect, useRef, useState } from "react";
import { ProcessedFileWithPreview } from "../types";
import { generateObjectUrl } from "../utils/generate-object-url";
import { processFiles } from "../utils/process-files";

type UseFilesProps = {
  maxFiles: number;
  maxSize: number;
  acceptedTypes: string[];
  disabled: boolean;
  onRemoveFile?: (file: ProcessedFileWithPreview) => void;
  onChange?: (files: File[]) => void;
  onError?: (errors: { message: string; file: File }[]) => void;
};

/**
 *
 * @param maxFiles - The maximum number of files that can be selected
 * @param maxSize - The maximum size of the files
 * @param acceptedTypes - The accepted types of the files
 * @param disabled - Whether the files input is disabled
 */
export default function useFiles({
  maxFiles,
  maxSize,
  acceptedTypes,
  disabled,
  onRemoveFile,
  onChange,
  onError,
}: UseFilesProps) {
  // -- STATE --
  const [isDragging, setIsDragging] = useState(false);
  const [processedFilesWithPreviews, setProcessedFilesWithPreviews] = useState<
    ProcessedFileWithPreview[]
  >([]);
  const [errors, setErrors] = useState<{ message: string; file: File }[]>([]);
  const isMaxFilesReached = processedFilesWithPreviews.length >= maxFiles;

  //   -- REFS --
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filesRef = useRef<ProcessedFileWithPreview[]>([]);

  //   -- HANDLERS --
  const handleAddFiles = async (files: File[]) => {
    if (disabled) return;
    const { toAdd, errors } = await processFiles({
      newFiles: files,
      existingFiles: processedFilesWithPreviews,
      config: { maxFiles, maxSize, acceptedTypes },
    });
    // -- ERROR HANDLING --
    if (errors.length > 0) {
      setErrors(errors);
      onError?.(errors);
    }
    // -- PROCESS FILES --
    if (toAdd.length === 0) return;
    const withPreviews: ProcessedFileWithPreview[] = toAdd.map((f) => ({
      ...f,
      objectUrl: generateObjectUrl(f.file),
    }));
    setProcessedFilesWithPreviews((currentFilesWithPreviews) => [
      ...currentFilesWithPreviews,
      ...withPreviews,
    ]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (!isDragging) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleAddFiles(files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = Array.from(e.target.files ?? []);
    handleAddFiles(files);
    e.target.value = "";
  };

  const handleRemoveFile = (file: ProcessedFileWithPreview) => {
    if (disabled) return;
    onRemoveFile?.(file);
    setProcessedFilesWithPreviews((currentFilesWithPreviews) =>
      currentFilesWithPreviews.filter((f) => f.hash !== file.hash),
    );
    URL.revokeObjectURL(file.objectUrl);
  };

  // -- RESET --
  const reset = () => {
    setProcessedFilesWithPreviews([]);
    setErrors([]);
    filesRef.current.forEach((f) => URL.revokeObjectURL(f.objectUrl));
  };

  //   -- EFFECTS --
  useEffect(() => {
    filesRef.current = processedFilesWithPreviews;
    const files = processedFilesWithPreviews.map((f) => f.file);
    onChange?.(files);
  }, [processedFilesWithPreviews, onChange]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.objectUrl));
    };
  }, []);

  return {
    state: {
      isDragging,
      isMaxFilesReached,
      processedFilesWithPreviews,
      errors,
    },
    setters: {
      setIsDragging,
    },
    handlers: {
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileChange,
      handleRemoveFile,
    },
    refs: {
      dropZoneRef,
      inputRef,
    },
    actions: {
      reset,
    },
  };
}
