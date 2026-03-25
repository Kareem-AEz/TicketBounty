import { useEffect, useRef, useState } from "react";
import { ProcessedFileWithPreview } from "../types";
import { generateObjectUrl } from "../utils/generate-object-url";
import { processFiles } from "../utils/process-files";

type UseFilesProps = {
  maxFiles: number;
  maxSize: number;
  acceptedTypes: string[];
};

/**
 *
 * @param maxFiles - The maximum number of files that can be selected
 * @param maxSize - The maximum size of the files
 * @param acceptedTypes - The accepted types of the files
 * @returns
 */
export default function useFiles({
  maxFiles,
  maxSize,
  acceptedTypes,
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

  //   -- HANDLERS --

  const handleAddFiles = async (files: File[]) => {
    const { toAdd, errors } = await processFiles({
      newFiles: files,
      existingFiles: processedFilesWithPreviews,
      config: { maxFiles, maxSize, acceptedTypes },
    });
    // -- ERROR HANDLING --
    if (errors.length > 0) {
      setErrors(errors);
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
    if (!isDragging) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleAddFiles(files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    handleAddFiles(files);
    e.target.value = "";
  };

  const handleRemoveFile = (file: File) => {
    setProcessedFilesWithPreviews((currentFilesWithPreviews) =>
      currentFilesWithPreviews.filter((f) => f.file !== file),
    );
  };

  //   -- EFFECTS --
  useEffect(() => {
    return () => {
      processedFilesWithPreviews.forEach((f) => {
        URL.revokeObjectURL(f.objectUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };
}
