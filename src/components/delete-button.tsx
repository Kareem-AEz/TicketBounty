"use client";

import { LucideTrash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import DetailButton from "@/features/ticket/components/detail-button";

type DeleteButtonProps = {
  onDelete: () => Promise<{ success: boolean; message?: string }>;
  title?: string;
  description?: string;
  label?: string;
  icon?: React.ReactElement;
  index?: number;
  animate?: boolean;
  trigger?: React.ReactNode;
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
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await onDelete();

      if (result.success) {
        toast.success(result.message || "Deleted successfully");
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to delete");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <DetailButton
            index={index}
            icon={icon}
            label={label}
            animate={animate}
          />
        )}
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
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteButton;
