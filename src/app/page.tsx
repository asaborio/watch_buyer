"use client";
import { useState } from "react";
import WatchForm, { WatchFormValues } from "@/components/WatchForm";
import { dollarsToCents, fmtUSD } from "@/lib/money";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function onEvaluate(v: WatchFormValues) {
    setLoading(true);
    setResult(null);
    try {
      const msrpCents = dollarsToCents(v.msrp);
      const brandDiscountBps = Math.round(Number(v.brandDiscountPct) * 100);

      const ebayRes = await fetch("/api/price/ebay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: v.brand,
          reference: v.reference,
        }),
      });
      const ebay = await ebayRes.json();

      const decision = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msrpCents, brandDiscountBps, ebay }),
      });

      const data = await decision.json();
      setResult({ data, inputs: v });
    } catch (e) {
      console.error(e);
      setResult({ error: (e as any)?.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Watch Buying Assistant</h1>
        <p className="text-gray-600 text-sm">
          Enter a watch to evaluate market lows and a suggested buy range.
        </p>
      </header>

      <WatchForm onEvaluate={onEvaluate} />

      {loading && <div className="text-sm text-gray-600">Evaluating…</div>}

      {result?.error && (
        <div className="border rounded p-4 text-red-700 bg-red-50">
          {String(result.error)}
        </div>
      )}

      {result?.data && (
        <section className="border rounded p-4 space-y-3">
          <div className="font-semibold">Marketplace lows</div>
          <div className="space-y-1">
            {result.data.market?.length ? (
              result.data.market.map((m: any) => (
                <div key={m.source} className="text-sm">
                  <span className="inline-block w-24">{m.source}:</span>{" "}
                  {fmtUSD(m.lowestCents)}
                  {m.url && (
                    <a
                      className="underline ml-2"
                      href={m.url}
                      target="_blank"
                    >
                      view
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">
                No qualifying listings found yet.
              </div>
            )}
          </div>

          <div className="font-semibold pt-2">Suggested Buy Range</div>
          <div className="text-lg">
            {fmtUSD(result.data.buyRange[0])} –{" "}
            {fmtUSD(result.data.buyRange[1])}
          </div>
          <div className="text-sm text-gray-600">
            Brand Target: {fmtUSD(result.data.brandTargetCents)}
          </div>
        </section>
      )}
    </main>
  );
}
