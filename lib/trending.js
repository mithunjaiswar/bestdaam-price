import { getLowestPrice } from "./helpers";

function numberFrom(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function reviewVolume(product) {
  const text = String(product?.ratings_reviews || "");
  const values = [...text.matchAll(/[\d,]+/g)].map((match) =>
    Number(match[0].replace(/,/g, ""))
  );
  return values.reduce((total, value) => total + value, 0);
}

function categoryPositions(products) {
  const counts = new Map();
  const positions = new Map();

  products.forEach((product) => {
    const category = product.category || "Other";
    const next = (counts.get(category) || 0) + 1;
    counts.set(category, next);
    positions.set(product.id, next);
  });

  return positions;
}

function priceMomentum(product, days) {
  const history = Array.isArray(product?.priceHistory)
    ? [...product.priceHistory].sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
      )
    : [];

  if (history.length < 2) {
    return 0;
  }

  const current = getLowestPrice(product);
  const previous = Number(history[Math.max(0, history.length - days)]?.price);

  if (!current || !previous || current >= previous) {
    return 0;
  }

  return Math.min(10, ((previous - current) / previous) * 100);
}

function bestDaamActivity(product, period) {
  const activity = product?.trendSignals?.bestDaam?.[period] || {};
  const clicks = numberFrom(activity.storeClicks);
  const views = numberFrom(activity.productViews);
  const shares = numberFrom(activity.shares);
  const searches = numberFrom(activity.searches);

  return Math.min(
    30,
    Math.log1p(clicks) * 5 +
      Math.log1p(views) * 2.5 +
      Math.log1p(shares) * 3 +
      Math.log1p(searches) * 2
  );
}

export function rankTrendingProducts(products, period = "week") {
  const positions = categoryPositions(products);
  const days = period === "month" ? 30 : 7;

  return products
    .map((product) => {
      const rank = positions.get(product.id) || 100;
      const rating = numberFrom(product.rating);
      const volume = reviewVolume(product);
      const badge = String(product?.trendSignals?.flipkartBadge || "").toLowerCase();

      const rankScore = Math.max(0, 30 * (1 - (rank - 1) / 100));
      const badgeScore = badge.includes("bestseller")
        ? 10
        : badge.includes("trending")
          ? 8
          : 0;
      const ratingScore = Math.max(0, Math.min(15, (rating - 3) * 7.5));
      const volumeScore = Math.min(5, Math.log10(volume + 1) * 1.25);
      const momentumScore = priceMomentum(product, days);
      const flipkartScore = Math.min(
        70,
        rankScore + badgeScore + ratingScore + volumeScore + momentumScore
      );
      const activityScore = bestDaamActivity(product, period);

      return {
        ...product,
        trend: {
          period,
          rank,
          flipkartScore,
          activityScore,
          score: Math.round((flipkartScore + activityScore) * 10) / 10,
        },
      };
    })
    .sort((a, b) => {
      if (b.trend.score !== a.trend.score) {
        return b.trend.score - a.trend.score;
      }

      return getLowestPrice(a) - getLowestPrice(b);
    });
}

export function getTrendingProducts(products, period = "week", limit = 20) {
  return rankTrendingProducts(products, period).slice(0, limit);
}
