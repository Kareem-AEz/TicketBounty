import { Prisma } from "@prisma/client";
import { Options, parseAsString, parseAsStringEnum } from "nuqs/server";
import { createSearchParamsCache } from "nuqs/server";

// -------------------------------------------------------
//                Ticket Query Options
//                Ticket Sort Options
// -------------------------------------------------------

const ticketQueryOptions: Options = {
  shallow: false,
  history: "replace",
  limitUrlUpdates: {
    method: "debounce",
    timeMs: 350,
  },
};

const ticketSortOptions: Options = {
  shallow: false,
  history: "replace",
};

// -------------------------------------------------------
//                Ticket Parsers
// -------------------------------------------------------

export const ticketQueryParser = parseAsString
  .withDefault("")
  .withOptions(ticketQueryOptions);

export const ticketSortParser = {
  sortKey: parseAsStringEnum(Object.values(Prisma.TicketScalarFieldEnum))
    .withDefault("createdAt")
    .withOptions(ticketSortOptions),

  sortOrder: parseAsStringEnum(Object.values(Prisma.SortOrder))
    .withDefault(Prisma.SortOrder.desc)
    .withOptions(ticketSortOptions),
};

export const ticketSearchParamsCache = createSearchParamsCache({
  query: ticketQueryParser,

  ...ticketSortParser,
});

export type TicketParsedSearchParams = Awaited<
  ReturnType<typeof ticketSearchParamsCache.parse>
>;
