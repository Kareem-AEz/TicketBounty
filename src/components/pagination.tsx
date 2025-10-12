"use client";

import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

type PaginationType = {
  page: number;
  size: number;
};

type PaginationProps = {
  pagination: PaginationType;
  onPaginationChange: (pagination: PaginationType) => void;
};

export default function Pagination({
  pagination,
  onPaginationChange,
}: PaginationProps) {
  const startOffset = pagination.page * pagination.size + 1;
  const endOffset = startOffset + pagination.size - 1;

  const label = `${startOffset} - ${endOffset} of X`;

  function handlePrevious() {
    if (pagination.page > 0)
      onPaginationChange({ ...pagination, page: pagination.page - 1 });
  }

  function handleNext() {
    if (pagination.page < pagination.size - 1)
      onPaginationChange({ ...pagination, page: pagination.page + 1 });
  }

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="text-muted-foreground text-sm select-none">{label}</span>

      <div className="flex gap-2">
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={handlePrevious}
          disabled={pagination.page < 1}
          aria-disabled={pagination.page < 1}
        >
          <LucideChevronLeft />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={handleNext}
          disabled={pagination.page >= pagination.size}
          aria-disabled={pagination.page >= pagination.size}
        >
          <LucideChevronRight />
        </Button>
      </div>
    </div>
  );
}
