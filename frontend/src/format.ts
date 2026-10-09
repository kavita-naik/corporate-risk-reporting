const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdFine = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const qty = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const count = new Intl.NumberFormat("en-US");

export const formatUsd = (value: number) => usd.format(value);

export function formatUsdCompact(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${trimCompact(abs / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${sign}$${trimCompact(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trimCompact(abs / 1_000)}K`;
  return usd.format(value);
}

function trimCompact(value: number): string {
  const digits = value >= 10 ? 0 : 1;
  return value.toFixed(digits).replace(/\.0$/, "");
}
export const formatUsdFine = (value: number) => usdFine.format(value);
export const formatQty = (value: number) => qty.format(value);
export const formatCount = (value: number) => count.format(value);

export function signedClass(value: number): string {
  if (value > 0) return "pos";
  if (value < 0) return "neg";
  return "";
}
