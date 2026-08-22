import offers from "../data/earnkaro-offers.json";

function safeHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function endOfIndiaDate(value) {
  const date = new Date(`${value}T23:59:59+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getCurrentEarnKaroOffers(now = new Date()) {
  return offers
    .filter((offer) => {
      const expiry = endOfIndiaDate(offer.expiresAt);
      return expiry && expiry >= now;
    })
    .map((offer) => ({
      ...offer,
      destinationUrl:
        safeHttpsUrl(offer.affiliateUrl) || safeHttpsUrl(offer.merchantUrl),
      affiliated: Boolean(safeHttpsUrl(offer.affiliateUrl)),
    }))
    .filter((offer) => offer.destinationUrl);
}
