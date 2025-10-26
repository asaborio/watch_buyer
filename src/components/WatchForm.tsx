"use client";
import { useState } from "react";

export interface WatchFormValues {
  brand: string;
  reference: string;
  msrp: string;
  brandDiscountPct: string;
}

interface WatchFormProps {
  onEvaluate: (values: WatchFormValues) => void;
}

export default function WatchForm({ onEvaluate }: WatchFormProps) {
  const [brand, setBrand] = useState("");
  const [reference, setReference] = useState("");
  const [msrp, setMsrp] = useState("");
  const [brandDiscountPct, setBrandDiscountPct] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onEvaluate({ brand, reference, msrp, brandDiscountPct });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Brand
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., Tudor"
            required
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Reference Number
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., M7941A1A0NU-0001"
            required
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          MSRP (USD)
          <input
            type="number"
            step="0.01"
            value={msrp}
            onChange={(e) => setMsrp(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 4550.00"
            required
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Brand Discount (%)
          <input
            type="number"
            step="0.01"
            value={brandDiscountPct}
            onChange={(e) => setBrandDiscountPct(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 15.00"
            required
          />
        </label>
        <p className="text-xs text-gray-500">
          Typical brand discount percentage off MSRP
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Evaluate
      </button>
    </form>
  );
}
