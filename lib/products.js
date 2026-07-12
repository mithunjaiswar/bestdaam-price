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
