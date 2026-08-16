function isValidPoint(point) {
  return (
    typeof point?.date === "string" &&
    typeof point?.price === "number" &&
    Number.isFinite(point.price) &&
    point.price > 0
  );
}
export function getPriceInsights(points, currentPrice) {
  const history = Array.isArray(points) ? points.filter(isValidPoint) : [];

  if (history.length === 0 || !currentPrice) return null;

  const prices = history.map((point) => point.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const average = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  const differenceFromAverage = currentPrice - average;
  const percentageFromAverage = average
    ? Math.round((differenceFromAverage / average) * 100)
    : 0;

  let verdict = "Typical price";
  let tone = "neutral";
  let explanation = "The current price is close to its recorded average.";

  if (currentPrice <= low) {
    verdict = "Recorded low";
    tone = "good";
    explanation = "This is the lowest price in BestDaam's recorded history.";
  } else if (currentPrice <= average * 0.95) {
    verdict = "Below average";
    tone = "good";
    explanation = "The current price is at least 5% below its recorded average.";
  } else if (currentPrice > average * 1.05) {
    verdict = "Above average";
    tone = "high";
    explanation = "The current price is more than 5% above its recorded average.";
  }

  return {
    low,
    high,
    average,
    differenceFromAverage,
    percentageFromAverage,
    observations: history.length,
    firstDate: history[0].date,
    lastDate: history[history.length - 1].date,
    verdict,
    tone,
    explanation,
  };
}

export function getFreshness(lastUpdated, now = new Date()) {
  if (!lastUpdated) {
    return { label: "Update date unavailable", tone: "stale", daysOld: null };
  }

  const updated = new Date(`${lastUpdated}T00:00:00Z`);

  if (Number.isNaN(updated.getTime())) {
    return { label: "Update date unavailable", tone: "stale", daysOld: null };
  }

  const daysOld = Math.max(
    0,
    Math.floor((now.getTime() - updated.getTime()) / 86_400_000)
  );

  if (daysOld <= 2) return { label: "Recently checked", tone: "fresh", daysOld };
  if (daysOld <= 7) return { label: "Checked this week", tone: "aging", daysOld };

  return { label: "Price may be outdated", tone: "stale", daysOld };
}
