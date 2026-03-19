"use client";

import { LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { deleteAttachment } from "../actions/delete-attachment";

type AttachmentDeleteButtonProps = {
  attachmentId: string;
};

export default function AttachmentDeleteButton({
  attachmentId,
}: AttachmentDeleteButtonProps) {
  const button = (isPending: boolean) => (
    <Button
      className="cursor-pointer"
      variant="destructive"
      size="icon-sm"
      disabled={isPending}
    >
      <LucideTrash2 />
    </Button>
  );

  const [dialog, dialogTrigger] = useConfirmDialog({
    title: "Delete Attachment",
    description: "Are you sure you want to delete this attachment?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    loadingLabel: "Deleting attachment...",
    trigger: (isPending) => button(isPending),
    action: deleteAttachment.bind(null, { attachmentId }),
  });

  return (
    <>
      {dialogTrigger}
      {dialog}
    </>
  );
}
