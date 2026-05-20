export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF"
  | "TRY" | "INR" | "MXN" | "BRL" | "KRW" | "SGD" | "THB" | "AED" | "CNY";

export type CurrencyInfo = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // relative to USD
  noDecimals?: boolean;
};

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", name: "US Dollar",          symbol: "$",    rate: 1 },
  EUR: { code: "EUR", name: "Euro",                symbol: "€",    rate: 0.92 },
  GBP: { code: "GBP", name: "British Pound",       symbol: "£",    rate: 0.79 },
  JPY: { code: "JPY", name: "Japanese Yen",        symbol: "¥",    rate: 149.5,  noDecimals: true },
  AUD: { code: "AUD", name: "Australian Dollar",   symbol: "A$",   rate: 1.53 },
  CAD: { code: "CAD", name: "Canadian Dollar",     symbol: "C$",   rate: 1.36 },
  CHF: { code: "CHF", name: "Swiss Franc",         symbol: "CHF ", rate: 0.89 },
  TRY: { code: "TRY", name: "Turkish Lira",        symbol: "₺",    rate: 32.5,   noDecimals: true },
  INR: { code: "INR", name: "Indian Rupee",        symbol: "₹",    rate: 83.2,   noDecimals: true },
  MXN: { code: "MXN", name: "Mexican Peso",        symbol: "MX$",  rate: 17.15 },
  BRL: { code: "BRL", name: "Brazilian Real",      symbol: "R$",   rate: 4.97 },
  KRW: { code: "KRW", name: "South Korean Won",    symbol: "₩",    rate: 1325,   noDecimals: true },
  SGD: { code: "SGD", name: "Singapore Dollar",    symbol: "S$",   rate: 1.34 },
  THB: { code: "THB", name: "Thai Baht",           symbol: "฿",    rate: 35.5,   noDecimals: true },
  AED: { code: "AED", name: "UAE Dirham",          symbol: "AED ", rate: 3.67 },
  CNY: { code: "CNY", name: "Chinese Yuan",        symbol: "¥",    rate: 7.24 },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export function formatPrice(usdAmount: number, currencyCode: string): string {
  const info = CURRENCIES[currencyCode] ?? CURRENCIES.USD;
  const converted = usdAmount * info.rate;
  const rounded = info.noDecimals ? Math.round(converted) : Math.round(converted);
  return `${info.symbol}${rounded.toLocaleString()}`;
}
