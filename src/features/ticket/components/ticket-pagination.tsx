"use client";

import { useQueryStates } from "nuqs";
import React from "react";
import Pagination from "@/components/pagination";
import { ticketPageParser } from "../utils/search-params";

export default function TicketPagination() {
  const [page, setPage] = useQueryStates(ticketPageParser);

  return <Pagination pagination={page} onPaginationChange={setPage} />;
}
