function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COMMON_TYPO_CORRECTIONS = new Map([
  ["ihpne", "iphone"],
  ["iphne", "iphone"],
  ["ipone", "iphone"],
  ["iphonee", "iphone"],
]);

function normalizeSearchQuery(value) {
  return normalize(value)
    .split(" ")
    .map((token) => COMMON_TYPO_CORRECTIONS.get(token) || token)
    .join(" ");
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

function editDistance(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];

    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function tokenMatchScore(queryToken, nameToken) {
  if (queryToken === nameToken) {
    return 1;
  }

  const hasNumericToken = /^\d+$/.test(queryToken) || /^\d+$/.test(nameToken);
  if (hasNumericToken) {
    return 0;
  }

  // Prefix matching is useful for deliberate partial searches ("iph"), but
  // one-character catalog tokens such as "i" must never match every query.
  if (
    Math.min(queryToken.length, nameToken.length) >= 3 &&
    (nameToken.startsWith(queryToken) || queryToken.startsWith(nameToken))
  ) {
    return 0.9;
  }

  // Allow common typing mistakes for meaningful words while keeping short
  // tokens and model numbers strict. Example: "ihpne" -> "iphone".
  if (queryToken.length >= 5 && nameToken.length >= 5) {
    const allowedDistance = 2;
    const distance = editDistance(queryToken, nameToken);

    if (distance <= allowedDistance) {
      return distance === 1 ? 0.85 : 0.7;
    }
  }

  return 0;
}

function nameScore(product, query) {
  const normalizedQuery = normalizeSearchQuery(query);
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
  const nameTokens = [...new Set(normalizedName.split(" ").filter(Boolean))];
  const tokenScores = queryTokens.map((token) =>
    Math.max(0, ...nameTokens.map((nameToken) => tokenMatchScore(token, nameToken)))
  );
  const matchedTokens = tokenScores.filter((score) => score > 0).length;

  if (matchedTokens === 0) {
    return 0;
  }

  const coverage = matchedTokens / queryTokens.length;
  const quality = tokenScores.reduce((sum, score) => sum + score, 0) / queryTokens.length;
  return coverage >= 0.6 ? Math.round(quality * 80) : 0;
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

  const normalizedQuery = normalizeSearchQuery(text);
  const categoryIntent = [...new Set(products.map((product) => product.category))]
    .filter(Boolean)
    .map((category) => ({ category, normalized: normalize(category) }))
    .filter(({ normalized }) =>
      ` ${normalizedQuery} `.includes(` ${normalized} `)
    )
    .sort((a, b) => b.normalized.length - a.normalized.length)[0]?.category;
  const candidates = categoryIntent
    ? products.filter((product) => product.category === categoryIntent)
    : products;

  return candidates
    .map((product) => ({
      product,
      score: nameScore(product, normalizedQuery),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.product);
}
