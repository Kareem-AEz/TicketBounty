"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";
import { deleteUrlParams, updateUrlParams } from "@/lib/search-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Bounty", value: "bounty" },
] as const;

export default function SelectInput() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSort = (value: (typeof SORT_OPTIONS)[number]["value"]) => {
    let newUrl = "";

    if (value === "newest") {
      newUrl = deleteUrlParams({
        params: searchParams.toString(),
        keys: ["sort"],
      });
    } else {
      newUrl = updateUrlParams({
        params: searchParams.toString(),
        updates: {
          sort: value,
        },
      });
    }

    router.replace(newUrl, { scroll: false });
  };

  return (
    <Select
      onValueChange={handleSort}
      defaultValue={searchParams.get("sort") || "newest"}
    >
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
