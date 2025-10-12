"use client";
import { useQueryState } from "nuqs";
import React from "react";
import { ticketSearchParsers } from "@/lib/search-params";
import { Input } from "./ui/input";

export default function SearchInput() {
  const [query, setQuery] = useQueryState("query", ticketSearchParsers.query);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
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
