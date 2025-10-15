"use client";

import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { useQueryStates } from "nuqs";
import React from "react";
import { TICKET_PAGE_SIZE } from "@/features/ticket/constants";
import { ticketPageParser } from "@/features/ticket/utils/search-params";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type PaginationMetadata = {
  cursor?: { id: string; createdAt: number };
  total: number;
  hasNextPage: boolean;
};

type PaginationType = {
  page: number;
  size: number;
};

type PaginationProps = {
  pagination: PaginationType;
  onPaginationChange: (pagination: PaginationType) => void;
  paginationMetadata: PaginationMetadata;
};

export default function Pagination({
  pagination,
  onPaginationChange,
  paginationMetadata,
}: PaginationProps) {
  const [page, setPage] = useQueryStates(ticketPageParser);
  const startOffset = pagination.page * pagination.size + 1;
  const endOffset = startOffset + pagination.size - 1;
  const actualEndOffset = Math.min(endOffset, paginationMetadata.total);

  const label = `${startOffset} - ${actualEndOffset} of ${paginationMetadata.total}`;

  function handlePrevious() {
    onPaginationChange({ ...pagination, page: pagination.page - 1 });
  }

  function handleNext() {
    onPaginationChange({ ...pagination, page: pagination.page + 1 });
  }

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="text-muted-foreground text-sm select-none">{label}</span>

      <div className="flex gap-2">
        <Select
          value={page.size.toString()}
          onValueChange={(value) => setPage({ page: 0, size: Number(value) })}
        >
          <SelectTrigger className="w-[80px]" aria-label="Page size">
            <SelectValue className="select-none" />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PAGE_SIZE.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={"outline"}
          size={"icon"}
          onClick={handlePrevious}
          disabled={pagination.page < 1}
          aria-disabled={pagination.page < 1}
          aria-label="Previous page"
        >
          <LucideChevronLeft />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          onClick={handleNext}
          disabled={
            !paginationMetadata.hasNextPage ||
            actualEndOffset === paginationMetadata.total
          }
          aria-disabled={
            !paginationMetadata.hasNextPage ||
            actualEndOffset === paginationMetadata.total
          }
          aria-label="Next page"
        >
          <LucideChevronRight />
        </Button>
      </div>
    </div>
  );
}
