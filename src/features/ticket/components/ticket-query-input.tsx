"use client";

import { useQueryState } from "nuqs";
import React from "react";
import QueryInput from "@/components/query-input";
import { ticketQueryParser } from "../utils/search-params";

export default function TicketQueryInput() {
  const [query, setQuery] = useQueryState("query", ticketQueryParser);

  return <QueryInput query={query} setQuery={setQuery} />;
}
