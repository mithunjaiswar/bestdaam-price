import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const catalogUrl = new URL("../data/products.json", import.meta.url);
const products = JSON.parse(await readFile(catalogUrl, "utf8"));

assert(Array.isArray(products), "Catalog must be a JSON array");
assert(products.length > 0, "Catalog must contain at least one product");

const ids = new Set();
const categoryNames = new Set();

for (const [index, product] of products.entries()) {
  const label = `Product ${index + 1}`;
  assert(typeof product.id === "string" && product.id.trim(), `${label}: id is required`);
  assert(!ids.has(product.id), `${label}: duplicate id ${product.id}`);
  ids.add(product.id);

  assert(typeof product.name === "string" && product.name.trim(), `${label}: name is required`);
  assert(typeof product.category === "string" && product.category.trim(), `${label}: category is required`);
  assert(typeof product.categoryKey === "string" && product.categoryKey.trim(), `${label}: categoryKey is required`);
  categoryNames.add(product.category);
  assert(typeof product.image === "string" && /^https:\/\//.test(product.image), `${label}: HTTPS image is required`);
  assert(Array.isArray(product.prices) && product.prices.length > 0, `${label}: at least one price is required`);

  for (const entry of product.prices) {
    assert(typeof entry.store === "string" && entry.store.trim(), `${label}: price store is required`);
    assert(Number.isFinite(entry.price) && entry.price > 0, `${label}: ${entry.store} price must be positive`);
    assert(typeof entry.url === "string" && /^https:\/\//.test(entry.url), `${label}: ${entry.store} URL must use HTTPS`);
    if (entry.affiliateUrl) {
      assert(/^https:\/\//.test(entry.affiliateUrl), `${label}: affiliate URL must use HTTPS`);
    }
  }

  if (product.priceHistory !== undefined) {
    assert(Array.isArray(product.priceHistory), `${label}: priceHistory must be an array`);
    for (const point of product.priceHistory) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(point.date), `${label}: invalid history date`);
      assert(Number.isFinite(point.price) && point.price > 0, `${label}: invalid history price`);
    }
  }
}

console.log(`Catalog valid: ${products.length} products, ${categoryNames.size} categories, ${ids.size} unique IDs.`);
