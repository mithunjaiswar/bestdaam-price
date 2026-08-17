const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

const INDIA_CAMPAIGN_PATTERN =
  /flipkart|myntra|ajio|croma|reliance digital|tata cliq|amazon india|nykaa|meesho|firstcry|snapdeal|boat|hkvitals|healthkart|jiomart|pepperfry|lenskart|makemytrip|cleartrip|ixigo|swiggy|zomato|bigbasket/i;

function cleanText(value, maxLength = 240) {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function getMerchantDestination(trackingUrl) {
  try {
    const redirectUrl = new URL(trackingUrl);
    const destination = new URL(redirectUrl.searchParams.get("url"));
    const blockedHosts = ["cuelinks.com", "linksredirect.com", "clnk.in"];

    if (
      destination.protocol !== "https:" ||
      blockedHosts.some(
        (host) =>
          destination.hostname === host ||
          destination.hostname.endsWith(`.${host}`)
      )
    ) {
      return "";
    }

    return destination.toString();
  } catch {
    return "";
  }
}

function isCurrentOffer(offer, now) {
  const status = offer.status?.toLowerCase();
  if (status && status !== "active" && status !== "live") return false;
  if (!offer.end_date) return true;

  const endDate = new Date(`${offer.end_date}T23:59:59+05:30`);
  return !Number.isNaN(endDate.getTime()) && endDate >= now;
}

function normalizeOffer(offer) {
  const trackingUrl = safeHttpsUrl(offer.tracking_url);
  const merchantUrl = getMerchantDestination(trackingUrl);
  const title = cleanText(offer.title, 160);
  const campaign = cleanText(offer.campaign_name, 80);

  if (!offer.id || !merchantUrl || !title || !campaign) return null;

  const percentOff = Number(offer.percent_off);

  return {
    id: String(offer.id),
    campaignId: Number(offer.campaign_id),
    title,
    description: cleanText(offer.description),
    terms: cleanText(offer.terms, 180),
    couponCode: cleanText(offer.coupon_code, 50),
    offerType: cleanText(offer.offer_type, 50),
    campaign,
    categories: Array.isArray(offer.categories)
      ? offer.categories.map((category) => cleanText(category, 50)).filter(Boolean)
      : [],
    merchantUrl,
    endDate: cleanText(offer.end_date, 10),
    percentOff: Number.isFinite(percentOff) && percentOff > 0 ? percentOff : null,
    updatedAt: cleanText(offer.updated_at, 40),
  };
}

export async function fetchCuelinksOffers(limit = 24) {
  const apiKey = process.env.CUELINKS_READ_API_KEY;

  if (!apiKey) return [];

  try {
    const response = await fetch(`${CUELINKS_API_BASE}/offers?per_page=500`, {
      headers: { Authorization: `Token ${apiKey}` },
      next: { revalidate: 1800 },
    });

    if (!response.ok) return [];

    const payload = await response.json();
    const now = new Date();

    const selected = (Array.isArray(payload?.data) ? payload.data : [])
      .filter(
        (offer) =>
          INDIA_CAMPAIGN_PATTERN.test(offer.campaign_name || "") &&
          isCurrentOffer(offer, now)
      )
      .map(normalizeOffer)
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b.percentOff || 0) - (a.percentOff || 0) ||
          b.updatedAt.localeCompare(a.updatedAt)
      )
      .slice(0, limit);

    return selected;
  } catch {
    return [];
  }
}
