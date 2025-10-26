import { NextRequest, NextResponse } from "next/server";
import { computeBuyTargets } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const { msrpCents, brandDiscountBps, ebay, chrono24 } = await req.json();
  const candidates = [ebay, chrono24]
    .filter(Boolean)
    .filter((c: any) => (c.lowestCents || 0) > 0);
  const lowest = candidates.sort(
    (a: any, b: any) => a.lowestCents - b.lowestCents
  )[0];
  const targets = computeBuyTargets(
    lowest?.lowestCents ?? 0,
    msrpCents,
    brandDiscountBps
  );
  return NextResponse.json({ market: candidates, lowest, ...targets });
}
