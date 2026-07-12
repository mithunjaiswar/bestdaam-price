import products from "../data/products.json";

export function getAllProducts() {
  return products;
}

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

export function getLowestPrice(product) {
  return Math.min(...product.prices.map((p) => p.price));
}

export function getHighestPrice(product) {
  return Math.max(...product.prices.map((p) => p.price));
}

export function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

export function getCategories() {
  return [...new Set(products.map((p) => p.category))];
}

// Demo price history: a deterministic walk seeded by product id, ending at
// today's lowest price. Replaced by real tracked prices in Phase 2.
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
