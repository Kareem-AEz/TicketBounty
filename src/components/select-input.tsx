"use client";

import { useQueryState } from "nuqs";
import React from "react";
import { ticketSearchParsers, TicketSort } from "@/lib/search-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SORT_OPTIONS = Object.values(TicketSort).map((sort) => ({
  label: sort.charAt(0).toUpperCase() + sort.slice(1),
  value: sort,
}));

export default function SelectInput() {
  const [sort, setSort] = useQueryState("sort", ticketSearchParsers.sort);

  const handleSort = (value: TicketSort) => {
    setSort(value);
  };

  return (
    <Select onValueChange={handleSort} value={sort}>
      <SelectTrigger className="user-select-none w-[180px]">
        <SelectValue className="user-select-none" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
