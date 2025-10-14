"use client";

import { LucidePencil, LucideTrash2 } from "lucide-react";
import React from "react";
import DeleteButton from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { commentDelete } from "../actions/comment-delete";

type CommentItemButtonsProps = {
  commentId: string;
  isMine: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CommentItemButtons({
  commentId,
  isMine,
  onEdit,
  onDelete,
}: CommentItemButtonsProps) {
  if (!isMine) return null;

  return (
    <div className="flex flex-col gap-y-2 p-1">
      {/* <Button
        variant={"outline"}
        size={"icon"}
        onClick={onDelete}
        aria-label="Delete comment"
      >
        <LucideTrash2 />
      </Button> */}
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={onEdit}
        aria-label="Edit comment"
      >
        <LucidePencil />
      </Button>

      <DeleteButton
        onDelete={async () => {
          const result = await commentDelete(commentId);
          if (result.success) {
            onDelete?.();
            return { success: true, message: result.message };
          }
          return {
            success: false,
            message: result.error || "Failed to delete comment",
          };
        }}
        animate={false}
        trigger={
          <Button variant={"outline"} size={"icon"} aria-label="Delete comment">
            <LucideTrash2 />
          </Button>
        }
      />
    </div>
  );
}
