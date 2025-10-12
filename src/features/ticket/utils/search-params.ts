import { Prisma } from "@prisma/client";
import {
  Options,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
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

const ticketGeneralOptions: Options = {
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
    .withOptions(ticketGeneralOptions),

  sortOrder: parseAsStringEnum(Object.values(Prisma.SortOrder))
    .withDefault(Prisma.SortOrder.desc)
    .withOptions(ticketGeneralOptions),
};

export const ticketPageParser = {
  page: parseAsInteger.withDefault(0).withOptions(ticketGeneralOptions),
  size: parseAsInteger.withDefault(10).withOptions(ticketGeneralOptions),
};

export const ticketSearchParamsCache = createSearchParamsCache({
  query: ticketQueryParser,

  ...ticketSortParser,
  ...ticketPageParser,
});

export type TicketParsedSearchParams = Awaited<
  ReturnType<typeof ticketSearchParamsCache.parse>
>;
