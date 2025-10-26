// src/lib/chrono24.ts
import * as cheerio from "cheerio";

export type ChronoListing = {
  title: string;
  priceCents: number;
  currency: string;
  url?: string;
  location?: string; // e.g. "United States"
  hasBox: boolean;
  hasPapers: boolean;
};

const USD_WORDS = ["usd", "us$", "$"];
const US_WORDS = ["united states", "usa", "us", "united states of america"];

export function parseMoneyToCents(
  text: string
): { cents: number; currency: string } | null {
  const clean = text.replace(/\u00A0/g, " ").trim(); // nbsp
  // Try to detect USD; otherwise default to USD for Chrono24 US searches
  const lower = clean.toLowerCase();
  const currency = USD_WORDS.some((w) => lower.includes(w)) ? "USD" : "USD";

  // Grab digits
  const m = clean.match(/([\$US\s]*)(\d[\d.,\s]+)/i);
  if (!m) return null;
  const num = Number(m[2].replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return null;

  return { cents: Math.round(num * 100), currency };
}

// Very tolerant parser for Chrono24 search pages (HTML pasted or fetched)
// Strategy:
// - Find listing containers by common attributes/classes
// - Extract price text, title text, and any location/condition text
// - Filter for US + "box" + "papers" mentions
export function parseChrono24Listings(
  html: string,
  baseUrl?: string
): ChronoListing[] {
  const $ = cheerio.load(html);

  // Candidate selectors (Chrono24 markup can change; we keep a wide net)
  const candidates = new Set<cheerio.Cheerio<cheerio.Element>>();

  // 1) Obvious listing containers
  $(
    '[data-testid="search-result"], [data-testid="listing-item"], article[data-listingid], li[data-listingid]'
  ).each((_, el) => {
    candidates.add($(el));
  });

  // 2) Fallback: cards with a visible price element
  $(
    '*[data-price-value], .price, [class*="price"], span:contains("$"), div:contains("$")'
  ).each((_, priceEl) => {
    const card = $(priceEl).closest("article, li, div");
    if (card && card.length) candidates.add(card);
  });

  const listings: ChronoListing[] = [];

  for (const $card of candidates) {
    const text = $card.text().replace(/\s+/g, " ").trim();
    if (!text) continue;

    // Title (best-effort)
    const title =
      $card
        .find('[data-testid="listing-title"], h2, h3, .title')
        .first()
        .text()
        .trim() || text.slice(0, 120);

    // Price detection
    let priceText =
      $card.find("[data-price-value]").attr("data-price-value") ||
      $card.find("[data-price-value]").text() ||
      $card.find('.price, [class*="price"]').first().text() ||
      $card
        .find("span, div")
        .filter((_, el) => $(el).text().includes("$"))
        .first()
        .text();

    if (!priceText) continue;
    const money = parseMoneyToCents(priceText);
    if (!money) continue;

    // URL
    let url = $card.find("a[href]").first().attr("href") || undefined;
    if (url && baseUrl && url.startsWith("/")) {
      try {
        url = new URL(url, baseUrl).toString();
      } catch {}
    }

    // Location heuristics
    const locationCand =
      $card
        .find(
          '[data-testid="listing-location"], .location, [class*="location"]'
        )
        .first()
        .text()
        .trim() ||
      (text.match(
        /(?:Ships from|Location|Seller location)[:\s]+([A-Za-z\s]+(?:United States|USA|US))/i
      )?.[1] ??
        "");

    const locationLower = locationCand.toLowerCase();
    const isUS =
      US_WORDS.some((w) => locationLower.includes(w)) ||
      /us\b|usa\b/i.test(locationCand);

    // Box/Papers heuristics (look at combined card text)
    const tl = text.toLowerCase();
    const hasBox = /\bbox\b|box included|original box/i.test(tl);
    const hasPapers = /\bpapers\b|warranty card|papers included|full set/i.test(
      tl
    );
    const looksLikeFullSet = /full set/i.test(tl);

    const listing: ChronoListing = {
      title,
      priceCents: money.cents,
      currency: money.currency,
      url,
      location: locationCand || (isUS ? "United States" : undefined),
      hasBox: hasBox || looksLikeFullSet, // treat "full set" as includes box
      hasPapers: hasPapers || looksLikeFullSet, // and papers
    };

    // Filter: US + Box + Papers only
    if (isUS && listing.hasBox && listing.hasPapers) {
      listings.push(listing);
    }
  }

  // Sort by price asc
  listings.sort((a, b) => a.priceCents - b.priceCents);
  return listings;
}

// This fetches a Chrono24 search URL server-side and parses it
export async function fetchChrono24AndParse(url: string) {
  const res = await fetch(url, {
    headers: {
      // Minimal headers; you can add more if needed
      "User-Agent": "Mozilla/5.0 (compatible; WatchBuyer/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  const html = await res.text();
  return parseChrono24Listings(html, new URL(url).origin);
}
