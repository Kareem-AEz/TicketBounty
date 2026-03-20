"use client";

import { LucideTrash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isRedirectError } from "@/features/auth/queries/use-auth-query";
import DetailButton from "@/features/ticket/components/detail-button";
import { usePatchedToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DeleteButtonProps = {
  onDelete: () => Promise<{ success: boolean; message?: string }>;
  title?: string;
  description?: string;
  label?: string;
  icon?: React.ReactElement;
  index?: number;
  animate?: boolean;
  trigger?: React.ReactNode;
  canDelete?: boolean;
};

function DeleteButton({
  onDelete,
  title = "Delete Item",
  description = "Are you sure? This action cannot be undone.",
  label = "Delete",
  icon = <LucideTrash2 />,
  index = 0,
  animate = true,
  trigger,
  canDelete = true,
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = usePatchedToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await onDelete();

      if (result.success) {
        toast(result.message || "Deleted successfully");
        setIsOpen(false);
      } else {
        toast(result.message || "Failed to delete");
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      toast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerComponent = canDelete ? (
    <DetailButton
      index={index}
      icon={icon}
      label={label}
      animate={animate}
      canDelete={canDelete}
    />
  ) : (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <DetailButton
            index={index}
            icon={icon}
            label={label}
            animate={animate}
            canDelete={canDelete}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-start">
        <span>You do not have permission to delete this item.</span>
        <span className="text-muted-foreground font-mono text-xs">
          Please contact your administrator to request permission.
        </span>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || triggerComponent}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
            type="button"
            data-umami-event="delete-confirm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteButton;
