import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { ActionState } from "@/components/form/utils/to-action-state";
import { usePatchedToast } from "@/hooks/use-toast";
import { MAX_ATTACHMENT_COUNT } from "../constants";
import { processAttachments } from "../utils/process-attachments";

type UseAttachmentUploadProps = {
  action: (_state: ActionState, formData: FormData) => Promise<ActionState>;
  initialActionState: ActionState;
};

type Attachment = {
  file: File;
  url: string;
};

export const useAttachmentUpload = ({
  action,
  initialActionState,
}: UseAttachmentUploadProps) => {
  const { toast } = usePatchedToast();

  const [actionState, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isMaxAttachmentsReached = attachments.length >= MAX_ATTACHMENT_COUNT;

  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const deleteButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeDeleteIndex, setActiveDeleteIndex] = useState(0);
  const attachmentLimitInfoRef = useRef<HTMLDivElement>(null);

  const shakeAttachmentLimitInfo = () => {
    attachmentLimitInfoRef.current?.animate(
      [
        { translate: "0px" },
        {
          translate: "-4px",
        },
        {
          translate: "3px",
        },
        {
          translate: "-2px",
        },
        {
          translate: "1px",
        },
        { translate: "0px" },
      ],
      {
        duration: 470,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    );
  };

  const handleAddAttachments = ({
    newAttachments,
    currentAttachments,
  }: {
    newAttachments: File[];
    currentAttachments: Attachment[];
  }) => {
    if (newAttachments.length > 0 && isMaxAttachmentsReached) {
      toast.error(
        `The maximum number of attachments (${MAX_ATTACHMENT_COUNT}) has been reached`,
      );
      shakeAttachmentLimitInfo();
      return;
    }

    const { toAdd, errors } = processAttachments({
      newAttachments,
      existingAttachments: currentAttachments.map((a) => a.file),
    });
    if (errors.length > 0) {
      for (const error of errors) {
        toast.error(error.message);
      }
    }

    if (toAdd.length === 0) return;

    setAttachments((currentAttachments) => [
      ...currentAttachments,
      ...toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
    toast.success(`${toAdd.length} attachments added`, {
      key: `attachments-added-${Date.now()}`,
    });
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
    handleAddAttachments({
      newAttachments: files,
      currentAttachments: attachments,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    handleAddAttachments({
      newAttachments: files,
      currentAttachments: attachments,
    });
  };

  const handleDeleteAttachment = (url: string, index?: number) => {
    URL.revokeObjectURL(url);
    if (index === undefined) {
      setAttachments((prev) => prev.filter((a) => a.url !== url));
      return;
    }

    let remainingCount = 0;
    flushSync(() => {
      setAttachments((prev) => {
        const next = prev.filter((a) => a.url !== url);
        remainingCount = next.length;
        return next;
      });
    });

    if (remainingCount === 0) {
      dropZoneRef.current?.focus();
    } else {
      const nextIndex = Math.min(index, remainingCount - 1);
      setActiveDeleteIndex(nextIndex);
      deleteButtonRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (attachments.length === 0) {
      toast.error("No attachments to upload");
      return;
    }
    startTransition(() => {
      const formData = new FormData();
      for (const attachment of attachments) {
        formData.append("attachment", attachment.file);
      }
      formAction(formData);
    });
  };

  useEffect(() => {
    return () =>
      attachments.forEach((attachment) => {
        URL.revokeObjectURL(attachment.url);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: {
      attachments,
      isMaxAttachmentsReached,
      isDragging,
      activeDeleteIndex,
      actionState,
      isPending,
    },
    setters: {
      setAttachments,
      setActiveDeleteIndex,
    },
    actions: {
      formAction,
    },
    refs: {
      inputRef,
      dropZoneRef,
      deleteButtonRefs,
      attachmentLimitInfoRef,
    },
    handlers: {
      handleDeleteAttachment,
      handleFileChange,
      handleDragOver,
      handleDrop,
      handleDragLeave,
      handleSubmit,
    },
  };
};
