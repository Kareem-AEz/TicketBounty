"use client";
import React from "react";
import { Input } from "./ui/input";

type QueryInputProps = {
  query: string;
  setQuery: (query: string) => void;
};

export default function QueryInput({ query, setQuery }: QueryInputProps) {
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
