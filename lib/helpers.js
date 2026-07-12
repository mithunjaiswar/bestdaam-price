const AMAZON_ASSOCIATE_TAG = "bestdaam0a-21";

export function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

export function getLowestPrice(product) {
  return Math.min(...product.prices.map((p) => p.price));
}

export function getHighestPrice(product) {
  return Math.max(...product.prices.map((p) => p.price));
}

export function getCategories(products) {
  return [...new Set(products.map((p) => p.category))];
}

// Store link with affiliate attribution. Entries with a real URL (e.g.
// EarnKaro profit links from the sheet) win; Amazon rows fall back to a
// tagged search link so every Amazon click carries our Associate ID.
export function getStoreUrl(product, entry) {
  if (entry.url && entry.url !== "#") return entry.url;
  if (entry.store === "Amazon") {
    return `https://www.amazon.in/s?k=${encodeURIComponent(
      product.name
    )}&tag=${AMAZON_ASSOCIATE_TAG}`;
  }
  return null;
}

// Demo price history: a deterministic walk seeded by product id, ending at
// today's lowest price. Replaced by real tracked prices in a later phase.
export function getPriceHistory(product, days = 30) {
  const lowest = getLowestPrice(product);
  let seed = 7;
  for (const ch of product.id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;

  const deltas = [];
  for (let i = 0; i < days - 1; i++) {
    seed = (seed * 271 + 331) % 9973;
    deltas.push((seed / 9973 - 0.5) * 0.03);
  }

  const points = [];
  let price = lowest;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      price: Math.max(1, Math.round(price / 10) * 10),
    });
    if (i < days - 1) {
      price = price * (1 + deltas[i]);
      const cap = 0.09;
      if (price > lowest * (1 + cap)) price = lowest * (1 + cap);
      if (price < lowest * (1 - cap)) price = lowest * (1 - cap);
    }
  }
  return points.reverse();
}
