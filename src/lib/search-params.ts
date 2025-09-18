import queryString from "query-string";

export type SearchParamsKeys = "query";

export type SearchParams = Partial<Record<"query", string | undefined>>;

type UpdateUrlParamsProps = {
  params: string;
} & {
  updates: SearchParams;
};

type DeleteUrlParamsProps = {
  params: string;
  keys: SearchParamsKeys[];
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
  );
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

/**
 * Parse search params into typed object
 */
export function parseUrlParams(params: string) {
  return queryString.parse(params, {
    arrayFormat: "comma",
    parseBooleans: true,
    parseNumbers: false,
  });
}
