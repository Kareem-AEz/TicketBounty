"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateUrlParams } from "@/lib/search-params";
import { Input } from "./ui/input";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("query") || "");

  const handleSearch = useDebouncedCallback((value: string) => {
    const newUrl = updateUrlParams({
      params: searchParams.toString(),
      updates: {
        query: value,
      },
    });

    router.replace(newUrl, { scroll: false });
  }, 350);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setQuery(value);
    handleSearch(value);
  };

  return (
    <Input
      placeholder="Search tickets"
      value={query}
      onChange={handleChange}
      className="w-full max-w-md"
    />
  );
}
