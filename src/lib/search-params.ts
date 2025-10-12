import { Route } from "next";
import {
  createSearchParamsCache,
  Options,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import queryString from "query-string";

export const ticketSearchOptions: Options = {
  shallow: false,
  history: "replace",
  limitUrlUpdates: {
    method: "debounce",
    timeMs: 350,
  },
};

export enum TicketSort {
  Newest = "newest",
  Bounty = "bounty",
}

export const ticketSearchParsers = {
  query: parseAsString.withDefault("").withOptions(ticketSearchOptions),
  sort: parseAsStringEnum<TicketSort>(Object.values(TicketSort))
    .withDefault(TicketSort.Newest)
    .withOptions({
      shallow: false,
      history: "replace",
    }),
};

export const searchParamsCache = createSearchParamsCache(ticketSearchParsers);

export type ParsedSearchParams = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

type UpdateUrlParamsProps = {
  params: string;
  updates: Partial<ParsedSearchParams>;
};

type DeleteUrlParamsProps = {
  params: string;
  keys: (keyof ParsedSearchParams)[];
};

/**
 * Update URL search params with new values
 * Pass null to remove a specific key
 */
export function updateUrlParams({ params, updates }: UpdateUrlParamsProps) {
  const queryObj = queryString.parse(params);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete queryObj[key];
    } else {
      queryObj[key] = value;
    }
  });

  return queryString.stringifyUrl(
    {
      url: window.location.pathname,
      query: queryObj,
    },
    {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    },
  ) as Route;
}

/**
 * Delete specific keys from URL search params
 */
export function deleteUrlParams({ params, keys }: DeleteUrlParamsProps) {
  const queryObj = queryString.parse(params);

  keys.forEach((key) => {
    delete queryObj[key];
  });

  return queryString.stringifyUrl(
    {
      url: window.location.pathname,
      query: queryObj,
    },
    {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    },
  );
}
