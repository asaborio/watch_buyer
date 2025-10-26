/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: string | number): number {
  const num = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(num * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as USD string
 */
export function fmtUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(centsToDollars(cents));
}
