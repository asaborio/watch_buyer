const EBAY_API = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";

export async function getEBayToken() {
  const id = process.env.EBAY_CLIENT_ID!;
  const secret = process.env.EBAY_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope/buy.browse",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!res.ok) throw new Error("eBay OAuth failed");
  const json = await res.json();
  return json.access_token as string;
}

type EbayLowestParams = {
  token: string;
  brand: string;
  reference: string;
  includePhrases?: string[];
  country?: string;
};

export async function searchEbayLowest(p: EbayLowestParams) {
  const q = `${p.brand} ${p.reference}`.trim();
  const url = new URL(EBAY_API);
  url.searchParams.set("q", q);
  url.searchParams.set("sort", "price");
  url.searchParams.set("limit", "50");
  url.searchParams.set("fieldgroups", "ASPECT_REFINEMENTS");
  url.searchParams.set("filter", `itemLocationCountry:${p.country ?? "US"}`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${p.token}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`eBay error ${res.status}`);
  const data = await res.json();
  const items = (data.itemSummaries || []).filter((it: any) => {
    const hay = `${it.title} ${it.shortDescription || ""}`.toLowerCase();
    const must = (p.includePhrases ?? ["box", "papers"]).every((ph) =>
      hay.includes(ph)
    );
    return must;
  });
  const ranked = items.sort(
    (a: any, b: any) => Number(a.price.value) - Number(b.price.value)
  );
  const lowest = ranked[0];
  return lowest
    ? {
        source: "EBAY" as const,
        lowestCents: Math.round(Number(lowest.price.value) * 100),
        currency: lowest.price.currency || "USD",
        url: lowest.itemWebUrl,
        location: lowest.itemLocation?.country || (p.country ?? "US"),
        hasBox: true,
        hasPapers: true,
        raw: lowest,
      }
    : { source: "EBAY" as const, lowestCents: 0, currency: "USD" };
}
