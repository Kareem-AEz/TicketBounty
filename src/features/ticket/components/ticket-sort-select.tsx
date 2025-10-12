"use client";

import { useQueryStates } from "nuqs";
import React from "react";
import SelectInput from "@/components/select-input";
import {
  TicketParsedSearchParams,
  ticketSortParser,
} from "../utils/search-params";

type TicketSortSelectProps = {
  options: {
    sortKey: TicketParsedSearchParams["sortKey"];
    sortOrder: TicketParsedSearchParams["sortOrder"];
    label: string;
  }[];
};

export default function TicketSortSelect({ options }: TicketSortSelectProps) {
  const [sort, setSort] = useQueryStates(ticketSortParser);

  return <SelectInput options={options} value={sort} setValue={setSort} />;
}
