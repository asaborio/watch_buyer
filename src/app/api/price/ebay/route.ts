import { NextRequest, NextResponse } from "next/server";
import { getEBayToken, searchEbayLowest } from "@/lib/ebay";

export async function POST(req: NextRequest) {
  const { brand, reference } = await req.json();
  const token = await getEBayToken();
  const result = await searchEbayLowest({ token, brand, reference });
  return NextResponse.json(result);
}
