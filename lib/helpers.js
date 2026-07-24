const AMAZON_ASSOCIATE_TAG = "bestdaam0a-21";

function isValidPrice(price) {
  return typeof price === "number" && Number.isFinite(price) && price > 0;
}

function getValidPrices(product) {
  if (!product || !Array.isArray(product.prices)) {
    return [];
  }

  return product.prices.filter((entry) => isValidPrice(entry.price));
}

function hasRealUrl(url) {
  return typeof url === "string" && url.trim() !== "" && url.trim() !== "#";
}

function isAmazonStore(entry) {
  return String(entry?.store || "").toLowerCase().includes("amazon");
}

function addAmazonAssociateTag(url) {
  if (!hasRealUrl(url)) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname.includes("amazon.in") ||
      parsedUrl.hostname.includes("amzn.in")
    ) {
      parsedUrl.searchParams.set("tag", AMAZON_ASSOCIATE_TAG);
      return parsedUrl.toString();
    }

    return url;
  } catch {
    return url;
  }
}

export function getAmazonSearchUrl(product) {
  const query = encodeURIComponent(product?.name || "product");

  return `https://www.amazon.in/s?k=${query}&tag=${AMAZON_ASSOCIATE_TAG}`;
}

export function formatINR(value) {
  if (!isValidPrice(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getLowestPrice(product) {
  const prices = getValidPrices(product).map((entry) => entry.price);

  if (prices.length === 0) {
    return 0;
  }

  return Math.min(...prices);
}

export function getHighestPrice(product) {
  const prices = getValidPrices(product).map((entry) => entry.price);

  if (prices.length === 0) {
    return 0;
  }

  return Math.max(...prices);
}

export function getCategories(products) {
  if (!Array.isArray(products)) {
    return [];
  }

  const categories = products
    .map((product) => product.category)
    .filter(Boolean);

  return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
}

export function getStoreUrl(product, entry) {
  // 1. First priority: EarnKaro / EK Affiliaters link
  if (hasRealUrl(entry?.affiliateUrl)) {
    return entry.affiliateUrl;
  }

  // 2. Second priority: normal store URL
  if (hasRealUrl(entry?.url)) {
    if (isAmazonStore(entry)) {
      return addAmazonAssociateTag(entry.url);
    }

    return entry.url;
  }

  // 3. Amazon fallback search link with associate tag
  if (isAmazonStore(entry)) {
    return getAmazonSearchUrl(product);
  }

  return null;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export function getPriceHistory(product) {
  const lowest = getLowestPrice(product);
  const realHistory = Array.isArray(product?.priceHistory)
    ? product.priceHistory
        .filter(
          (point) =>
            typeof point?.date === "string" &&
            isValidPrice(point?.price)
        )
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  if (realHistory.length > 0) {
    return realHistory;
  }

  if (!lowest) {
    return [];
  }

  return [
    {
      date: formatDate(new Date()),
      price: lowest,
    },
  ];
}
