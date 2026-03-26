import { useRef, useState } from "react";
import { ProcessedFileWithPreview } from "../types";

type UseFileInputNavigationProps = {
  processedFilesWithPreviews: ProcessedFileWithPreview[];
  onRemoveFile?: (file: ProcessedFileWithPreview) => void;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
};

export default function useFileInputNavigation({
  processedFilesWithPreviews,
  dropZoneRef,
}: UseFileInputNavigationProps) {
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(0);
  const deleteButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleRemoveFileFocus = () => {
    const remainingCount = processedFilesWithPreviews.length - 1;
    if (remainingCount === 0) {
      dropZoneRef.current?.focus();
    } else {
      const nextIndex = Math.min(activeDeleteIndex, remainingCount - 1);
      setActiveDeleteIndex(nextIndex);

      requestAnimationFrame(() => deleteButtonRefs.current[nextIndex]?.focus());
    }
  };

  return {
    state: {
      activeDeleteIndex,
    },
    handlers: {
      setActiveDeleteIndex,
      handleRemoveFileFocus,
    },
    refs: {
      deleteButtonRefs,
    },
  };
}
