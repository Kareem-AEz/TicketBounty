import {
  createSearchParamsCache,
  type Options,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { SortOrder, TicketScalarFieldEnum } from "../constants/enums";

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
  scroll: false,
};

const ticketGeneralOptions: Options = {
  shallow: false,
  history: "replace",
  scroll: false,
};

// -------------------------------------------------------
//                Ticket Parsers
// -------------------------------------------------------

export const ticketQueryParser = parseAsString
  .withDefault("")
  .withOptions(ticketQueryOptions);

export const ticketSortParser = {
  sortKey: parseAsStringEnum(Object.values(TicketScalarFieldEnum))
    .withDefault("createdAt")
    .withOptions(ticketGeneralOptions),

  sortOrder: parseAsStringEnum(Object.values(SortOrder))
    .withDefault(SortOrder.desc)
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
