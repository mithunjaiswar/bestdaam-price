export const SAVED_PRODUCTS_KEY = "bestdaam-saved-products";
export const SAVED_PRODUCTS_EVENT = "bestdaam-saved-products-change";

export function getSavedProductIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = JSON.parse(
      window.localStorage.getItem(SAVED_PRODUCTS_KEY) || "[]"
    );
    return Array.isArray(value)
      ? [...new Set(value.filter((id) => typeof id === "string" && id))]
      : [];
  } catch {
    return [];
  }
}

export function isProductSaved(productId) {
  return getSavedProductIds().includes(productId);
}

export function toggleSavedProduct(productId) {
  const current = getSavedProductIds();
  const isSaved = current.includes(productId);
  const next = isSaved
    ? current.filter((id) => id !== productId)
    : [...current, productId];

  window.localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(SAVED_PRODUCTS_EVENT, { detail: { ids: next } })
  );

  return !isSaved;
}

