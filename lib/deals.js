import {
  getHighestPrice,
  getLowestPrice,
  getPriceHistory,
  formatINR,
} from "./helpers";

export const BUDGET_PAGES = {
  "under-500": {
    label: "Under ₹500",
    heading: "Best products under ₹500",
    description:
      "Explore affordable everyday products with verified prices under ₹500.",
    min: 0,
    max: 500,
  },
  "under-1000": {
    label: "Under ₹1,000",
    heading: "Best products under ₹1,000",
    description:
      "Compare useful electronics, accessories and everyday products under ₹1,000.",
    min: 0,
    max: 1000,
  },
  "under-5000": {
    label: "Under ₹5,000",
    heading: "Best products under ₹5,000",
    description:
      "Discover affordable products across popular categories, all priced under ₹5,000.",
    min: 0,
    max: 5000,
  },
};

export function getDealBadge(product) {
  const current = getLowestPrice(product);
  const history = getPriceHistory(product);
  const previousPrices = history.slice(0, -1).map((point) => point.price);

  if (
    previousPrices.length > 0 &&
    current <= Math.min(...previousPrices)
  ) {
    return "Lowest tracked price";
  }

  const savings = getHighestPrice(product) - current;

  if (savings > 0) {
    return `Save up to ${formatINR(savings)}`;
  }

  return "Affordable pick";
}

export function getBudgetProducts(products, budgetKey) {
  const budget = BUDGET_PAGES[budgetKey];

  if (!budget) {
    return [];
  }

  return products
    .filter((product) => {
      const price = getLowestPrice(product);
      return price > budget.min && price <= budget.max;
    })
    .sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
}

export function getFeaturedDeals(products, limit = 30) {
  const eligible = products
    .filter((product) => {
      const price = getLowestPrice(product);
      return price >= 99 && price <= 5000 && product.prices?.length > 0;
    })
    .sort((a, b) => getLowestPrice(a) - getLowestPrice(b));

  const categoryCounts = new Map();
  const selected = [];

  for (const product of eligible) {
    const category = product.category || "Other";
    const count = categoryCounts.get(category) || 0;

    if (count >= 4) {
      continue;
    }

    selected.push(product);
    categoryCounts.set(category, count + 1);

    if (selected.length === limit) {
      break;
    }
  }

  return selected;
}
