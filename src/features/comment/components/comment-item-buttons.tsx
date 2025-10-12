"use client";

import { LucideEdit, LucideTrash2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

type CommentItemButtonsProps = {
  isMine: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CommentItemButtons({
  isMine,
  onEdit,
  onDelete,
}: CommentItemButtonsProps) {
  if (!isMine) return null;

  return (
    <div className="flex flex-col gap-y-2 p-1">
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={onDelete}
        aria-label="Delete comment"
      >
        <LucideTrash2 />
      </Button>
      <Button
        variant={"outline"}
        size={"icon"}
        onClick={onEdit}
        aria-label="Edit comment"
      >
        <LucideEdit />
      </Button>
    </div>
  );
}
