import localProducts from "../data/products.json";

// Product catalog mode:
// Website direct data/products.json se products load karegi.
// Ye file local scraper/exporter se generated catalog ko serve karti hai.
// Google Sheet source abhi disabled hai.

export async function fetchProducts() {
  return localProducts;
}

// Build-time snapshot, used for pre-rendering known product pages.
export function getLocalProducts() {
  return localProducts;
}