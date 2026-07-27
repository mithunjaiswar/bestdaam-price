export const SITE_URL = "https://bestdaam.in";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function parseRatingCount(value) {
  const numbers = String(value || "")
    .match(/[\d,]+/g)
    ?.map((item) => Number(item.replace(/,/g, "")))
    .filter((item) => Number.isFinite(item));

  return numbers?.[0] || 0;
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
