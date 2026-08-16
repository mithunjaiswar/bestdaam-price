const CUELINKS_API_BASE = "https://developers.cuelinks.com/pub_api/v3";

const SUPPORTED_MERCHANT_HOSTS = [
  "flipkart.com",
  "myntra.com",
  "ajio.com",
  "tatacliq.com",
  "reliancedigital.in",
  "croma.com",
  "pepperfry.com",
];

export function isSupportedCuelinksUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return false;

    return SUPPORTED_MERCHANT_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function isSafeTrackingUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function convertCuelinksUrl(url, attribution = {}) {
  const apiKey = process.env.CUELINKS_API_KEY;

  if (!apiKey || !isSupportedCuelinksUrl(url)) {
    return { trackingUrl: url, affiliated: false };
  }

  const response = await fetch(`${CUELINKS_API_BASE}/links/convert`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      channel_id: process.env.CUELINKS_CHANNEL_ID
        ? Number(process.env.CUELINKS_CHANNEL_ID)
        : undefined,
      subid: attribution.productId,
      subid2: attribution.store,
      subid3: attribution.placement || "bestdaam",
      shorten: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Cuelinks conversion failed (${response.status})`);
  }

  const payload = await response.json();
  const data = payload?.data;

  if (
    !data?.affiliated ||
    !isSafeTrackingUrl(data.tracking_url) ||
    !isSupportedCuelinksUrl(data.original_url || url)
  ) {
    return { trackingUrl: url, affiliated: false };
  }

  return {
    trackingUrl: data.tracking_url,
    affiliated: true,
    campaign: data.campaign || null,
  };
}
