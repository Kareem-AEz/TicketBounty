type PageSearchParamsType = {
  searchParams: Promise<
    Record<SearchParamsKeys, string | string[] | undefined>
  >;
};
