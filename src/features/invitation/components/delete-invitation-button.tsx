"use client";

import { LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { deleteInvitation } from "../actions/delete-invitation";

type DeleteInvitationButtonProps = {
  tokenHash: string;
  organizationId: string;
  onSuccess?: () => void;
  onClick?: () => void;
};

export default function DeleteInvitationButton({
  tokenHash,
  organizationId,
  onSuccess,
  onClick,
}: DeleteInvitationButtonProps) {
  const [dialog, dialogTrigger] = useConfirmDialog({
    title: "Delete Invitation",
    description: "Are you sure you want to delete this invitation?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    loadingLabel: "Deleting invitation...",
    trigger: (isPending) => (
      <Button variant="destructive" size="icon" disabled={isPending}>
        <LucideTrash2 className="size-4" />
      </Button>
    ),
    action: deleteInvitation.bind(null, { tokenHash, organizationId }),
    onSuccess,
    onClick,
  });
  return (
    <>
      {dialogTrigger}
      {dialog}
    </>
  );
}
