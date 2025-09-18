"use client";

import { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { updateUrlParams } from "@/lib/search-params";
import { Input } from "./ui/input";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("query") || "");

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      const newUrl = updateUrlParams({
        params: searchParams.toString(),
        updates: {
          query: value,
        },
      });

      router.replace(newUrl as Route, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Input
      placeholder="Search tickets"
      onChange={handleSearch}
      value={query || ""}
      className="w-full max-w-md"
    />
  );
}
