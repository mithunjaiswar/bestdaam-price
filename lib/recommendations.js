import { getLowestPrice } from "./helpers";

function tokens(value) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((token) => token.length > 2)
  );
}
export function getSimilarProducts(products, selected, limit = 4) {
  if (!selected || !Array.isArray(products)) return [];

  const selectedTokens = tokens(`${selected.name} ${selected.rawName || ""}`);
  const selectedPrice = getLowestPrice(selected);

  return products
    .filter(
      (product) =>
        product.id !== selected.id && product.categoryKey === selected.categoryKey
    )
    .map((product) => {
      const productTokens = tokens(`${product.name} ${product.rawName || ""}`);
      const sharedTokens = [...selectedTokens].filter((token) => productTokens.has(token));
      const productPrice = getLowestPrice(product);
      const priceDistance =
        selectedPrice && productPrice
          ? Math.abs(productPrice - selectedPrice) / selectedPrice
          : 1;

      return {
        product,
        score: sharedTokens.length * 10 + Math.max(0, 5 - priceDistance * 5),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => result.product);
}
