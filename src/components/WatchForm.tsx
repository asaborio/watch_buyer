"use client";
import { useState, useMemo } from "react";

export interface WatchFormValues {
  brand: string;
  reference: string;
  msrp: string;
  brandDiscountPct: string;
  description: string;
  chrono24Url?: string;
  chrono24Html?: string;
}

interface WatchFormProps {
  onEvaluate: (values: WatchFormValues) => void;
}

export default function WatchForm({ onEvaluate }: WatchFormProps) {
  const [values, setValues] = useState<WatchFormValues>({
    brand: "",
    reference: "",
    msrp: "",
    brandDiscountPct: "",
    description: "",
    chrono24Url: "",
    chrono24Html: "",
  });

  function update<K extends keyof WatchFormValues>(key: K, val: WatchFormValues[K]) {
    setValues(prev => ({ ...prev, [key]: val }));
  }

  const disableButton = useMemo(() => {
    return (
      !values.brand ||
      !values.reference ||
      !values.msrp ||
      !values.brandDiscountPct
    );
  }, [values]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onEvaluate(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4 bg-white shadow-sm">
      {/* Brand */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Brand</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Tudor, AP, Rolex..."
          value={values.brand}
          onChange={e=>update("brand", e.target.value)}
          required
        />
      </div>

      {/* Reference */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Reference #</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="M7941A1A0NU-0001"
          value={values.reference}
          onChange={e=>update("reference", e.target.value)}
          required
        />
      </div>

      {/* MSRP */}
      <div className="space-y-1">
        <label className="text-sm font-medium">MSRP (USD)</label>
        <input
          type="number"
          step="0.01"
          className="border rounded p-2 w-full"
          placeholder="4550.00"
          value={values.msrp}
          onChange={e=>update("msrp", e.target.value)}
          required
        />
      </div>

      {/* Brand Discount */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Brand Discount (%)</label>
        <input
          type="number"
          step="0.01"
          className="border rounded p-2 w-full"
          placeholder="15.00"
          value={values.brandDiscountPct}
          onChange={e=>update("brandDiscountPct", e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          Typical alternative marketplace discount % off MSRP
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="border rounded p-2 w-full min-h-[80px]"
          placeholder="Dial, case material, bracelet, condition..."
          value={values.description}
          onChange={e=>update("description", e.target.value)}
        />
      </div>

      {/* Chrono24 URL */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Chrono24 Search URL (optional)</label>
        <input
          className="border rounded p-2 w-full"
          placeholder="Paste Chrono24 search URL"
          value={values.chrono24Url}
          onChange={e=>update("chrono24Url", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          If blocked, paste the HTML below instead.
        </p>
      </div>

      {/* Chrono24 HTML */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Chrono24 Results HTML (fallback)
        </label>
        <textarea
          className="border rounded p-2 w-full min-h-[120px]"
          placeholder="Paste page source HTML here if fetch is blocked"
          value={values.chrono24Html}
          onChange={e=>update("chrono24Html", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={disableButton}
        className={`w-full rounded px-4 py-2 text-white font-medium transition-colors ${
          disableButton ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
        }`}
      >
        Evaluate
      </button>
    </form>
  );
}
