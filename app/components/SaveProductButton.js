"use client";

import { useEffect, useState } from "react";
import {
  isProductSaved,
  SAVED_PRODUCTS_EVENT,
  toggleSavedProduct,
} from "../../lib/saved-products";
import { trackEvent } from "../../lib/tracking";

export default function SaveProductButton({
  product,
  compact = false,
  className = "",
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = () => setSaved(isProductSaved(product.id));

    refresh();
    window.addEventListener(SAVED_PRODUCTS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SAVED_PRODUCTS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [product.id]);

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const nextSaved = toggleSavedProduct(product.id);
    setSaved(nextSaved);
    trackEvent(nextSaved ? "save_product" : "unsave_product", {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
  }

  return (
    <button
      type="button"
      className={`save-product-btn ${compact ? "compact" : ""} ${
        saved ? "saved" : ""
      } ${className}`.trim()}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${
        saved ? "from" : "to"
      } saved products`}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {!compact && (saved ? "Saved for tracking" : "Save & track")}
    </button>
  );
}

