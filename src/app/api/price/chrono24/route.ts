// src/app/api/price/chrono24/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchChrono24AndParse, parseChrono24Listings } from "@/lib/chrono24";

export async function POST(req: NextRequest) {
  try {
    const { chrono24Url, htmlFallback } = await req.json();

    if (!chrono24Url && !htmlFallback) {
      return NextResponse.json({
        source: "CHRONO24",
        lowestCents: 0,
        currency: "USD",
        error: "Provide chrono24Url or htmlFallback",
      });
    }

    let listings;
    if (htmlFallback) {
      listings = parseChrono24Listings(
        htmlFallback,
        "https://www.chrono24.com"
      );
    } else {
      listings = await fetchChrono24AndParse(chrono24Url);
    }

    if (!listings.length) {
      return NextResponse.json({
        source: "CHRONO24",
        lowestCents: 0,
        currency: "USD",
        message: "No US + Box + Papers listings found",
      });
    }

    const lowest = listings[0];
    return NextResponse.json({
      source: "CHRONO24",
      lowestCents: lowest.priceCents,
      currency: lowest.currency,
      url: lowest.url ?? chrono24Url,
      location: lowest.location ?? "US",
      hasBox: lowest.hasBox,
      hasPapers: lowest.hasPapers,
      sampleCount: listings.length,
    });
  } catch (e: any) {
    return NextResponse.json({
      source: "CHRONO24",
      lowestCents: 0,
      currency: "USD",
      error: e?.message ?? "Unknown error",
    });
  }
}
