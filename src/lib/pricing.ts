/**
 * Compute buy target range based on market data and brand discount
 */
export function computeBuyTargets(
  marketLowestCents: number,
  msrpCents: number,
  brandDiscountBasisPoints: number
) {
  // Brand target = MSRP - brand discount
  // e.g., MSRP $4,550 with 15% discount = $3,867.50
  const brandTargetCents = msrpCents - Math.round((msrpCents * brandDiscountBasisPoints) / 10000);

  // Buy range option 1: Market low minus $2,000
  const buyTargetMinus2000Cents = marketLowestCents - 200000;

  // Buy range option 2: Market low minus 20%
  const buyTargetMinus20PctCents = Math.round(marketLowestCents * 0.8);

  // The buy range is the lower of the two targets up to the brand target
  const buyRangeLow = Math.min(buyTargetMinus2000Cents, buyTargetMinus20PctCents);
  const buyRangeHigh = brandTargetCents;

  return {
    brandTargetCents,
    suggestedBuyMinus2000Cents: buyTargetMinus2000Cents,
    suggestedBuyMinus20PctCents: buyTargetMinus20PctCents,
    buyRange: [Math.max(0, buyRangeLow), buyRangeHigh] as [number, number],
  };
}

