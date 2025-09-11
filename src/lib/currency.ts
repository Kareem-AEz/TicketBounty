import { CurrencyBig } from "./big";

export const toCent = (currency: number) =>
  CurrencyBig(currency).mul(100).toNumber();

export const fromCent = (cent: number) => CurrencyBig(cent).div(100).toNumber();

export const centToCurrency = (cent: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(fromCent(cent));
