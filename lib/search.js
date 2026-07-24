function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUrlIdentity(value) {
  try {
    const url = new URL(value.trim());
    const pid = url.searchParams.get("pid");

    if (pid) {
      return `flipkart:${pid.toLowerCase()}`;
    }

    const asinMatch = url.pathname.match(
      /\/(?:dp|gp\/product)\/([a-z0-9]{10})/i
    );

    if (asinMatch) {
      return `amazon:${asinMatch[1].toLowerCase()}`;
    }

    return `${url.hostname.replace(/^www\./, "")}${url.pathname}`
      .replace(/\/+$/, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

export function looksLikeProductUrl(value) {
  const text = String(value || "").trim();

  return (
    /^https?:\/\//i.test(text) ||
    text.includes("www.") ||
    text.includes("amazon.in/") ||
    text.includes("flipkart.com/")
  );
}

export function getSearchLabel(value) {
  const text = String(value || "").trim();

  if (!looksLikeProductUrl(text)) {
    return text;
  }

  try {
    const url = new URL(
      /^https?:\/\//i.test(text) ? text : `https://${text}`
    );
    const productPath = url.pathname.split("/p/")[0];
    const parts = productPath.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "product";

    return slug.replace(/[-_]+/g, " ");
  } catch {
    return "product";
  }
}

function productUrlIdentities(product) {
  return (product.prices || [])
    .flatMap((entry) => [entry.url, entry.affiliateUrl])
    .filter(Boolean)
    .map(extractUrlIdentity)
    .filter(Boolean);
}

function nameScore(product, query) {
  const normalizedQuery = normalize(query);
  const normalizedName = normalize(
    `${product.name} ${product.rawName || ""} ${product.category || ""}`
  );

  if (!normalizedQuery) {
    return 1;
  }

  if (normalizedName === normalizedQuery) {
    return 100;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 90;
  }

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const nameTokens = new Set(normalizedName.split(" ").filter(Boolean));
  const matchedTokens = queryTokens.filter((token) =>
    [...nameTokens].some(
      (nameToken) =>
        nameToken === token ||
        nameToken.startsWith(token) ||
        token.startsWith(nameToken)
    )
  ).length;

  if (matchedTokens === 0) {
    return 0;
  }

  const coverage = matchedTokens / queryTokens.length;
  return coverage >= 0.6 ? Math.round(coverage * 80) : 0;
}

export function searchProducts(products, query) {
  const text = String(query || "").trim();

  if (!text) {
    return products;
  }

  if (looksLikeProductUrl(text)) {
    const identity = extractUrlIdentity(
      /^https?:\/\//i.test(text) ? text : `https://${text}`
    );

    if (!identity) {
      return [];
    }

    return products.filter((product) =>
      productUrlIdentities(product).includes(identity)
    );
  }

  return products
    .map((product) => ({
      product,
      score: nameScore(product, text),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.product);
}
