import fs from "node:fs";
import { searchProducts } from "../lib/search.js";

const payload = JSON.parse(fs.readFileSync(new URL("../data/products.json", import.meta.url)));
const products = Array.isArray(payload) ? payload : payload.products;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const typoResults = searchProducts(products, "ihpne");
assert(typoResults.length > 0, "iPhone typo should return results");
assert(
  typoResults.every((product) => product.category === "iPhone"),
  "iPhone typo returned an unrelated category"
);

const modelResults = searchProducts(products, "iphone 15");
assert(modelResults.length > 0, "iPhone 15 should return results");
assert(
  modelResults.every((product) => /iphone 15\b/i.test(product.name)),
  "iPhone 15 returned a different model or accessory"
);

const exactResults = searchProducts(products, "apple iphone");
assert(exactResults.length > 0, "Apple iPhone should return results");
assert(
  exactResults.slice(0, 20).every((product) => /apple iphone/i.test(product.name)),
  "Apple iPhone ranking contains an unrelated leading result"
);

console.log(
  `Search valid: typo=${typoResults.length}, iphone15=${modelResults.length}, appleIphone=${exactResults.length}`
);
