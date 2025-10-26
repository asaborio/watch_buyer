import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const result = await prisma.watch.create({
      data: {
        brand: "Tudor",
        reference: "M7941A1A0NU-0001",
        msrpCents: 455000,
        brandDiscountBasisPoints: 1500,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
