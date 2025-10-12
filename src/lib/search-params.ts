import { Route } from "next";
import { SearchParams } from "nuqs";
import queryString from "query-string";

type UpdateUrlParamsProps = {
  params: string;
  updates: Partial<SearchParams>;
};

type DeleteUrlParamsProps = {
  params: string;
  keys: (keyof SearchParams)[];
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
