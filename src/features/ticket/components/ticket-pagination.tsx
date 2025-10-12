"use client";

import { useQueryState, useQueryStates } from "nuqs";
import React, { useEffect, useRef } from "react";
import Pagination, { PaginationMetadata } from "@/components/pagination";
import { ticketPageParser, ticketQueryParser } from "../utils/search-params";

export default function TicketPagination({
  paginationMetadata,
}: {
  paginationMetadata: PaginationMetadata;
}) {
  const [page, setPage] = useQueryStates(ticketPageParser);

  // for reacting to sort and query changes
  const [query] = useQueryState("query", ticketQueryParser);

  const userRef = useRef({ query });

  useEffect(() => {
    if (JSON.stringify(userRef.current) === JSON.stringify({ query })) return;

    userRef.current = { query };
    setPage({ ...page, page: 0 });
  }, [query, page, setPage]);

  return (
    <Pagination
      pagination={{ page: page.page, size: Number(page.size) }}
      onPaginationChange={setPage}
      paginationMetadata={paginationMetadata}
    />
  );
}
