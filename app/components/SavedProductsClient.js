"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatINR, getLowestPrice } from "../../lib/helpers";
import {
  getSavedProductIds,
  SAVED_PRODUCTS_EVENT,
} from "../../lib/saved-products";
import SaveProductButton from "./SaveProductButton";

export default function SavedProductsClient({ products }) {
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    const refresh = () => setSavedIds(getSavedProductIds());

    refresh();
    window.addEventListener(SAVED_PRODUCTS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SAVED_PRODUCTS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const savedProducts = savedIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  if (savedProducts.length === 0) {
    return (
      <div className="saved-empty">
        <span aria-hidden="true">♡</span>
        <h2>Your saved list is empty</h2>
        <p>
          Save products you are considering. PriceVichar will keep them together
          so you can compare prices again later.
        </p>
        <Link href="/" className="buy-btn">
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div className="saved-grid">
      {savedProducts.map((product) => (
        <article className="saved-card" key={product.id}>
          <Link href={`/product/${product.id}`} className="saved-card-main">
            <div className="saved-card-media">
              {product.image ? (
                <img src={product.image} alt={product.name} loading="lazy" />
              ) : (
                <span className="emoji">{product.emoji}</span>
              )}
            </div>
            <div>
              <span className="card-category">{product.category}</span>
              <h2>{product.name}</h2>
              <p>Best available price</p>
              <strong>{formatINR(getLowestPrice(product))}</strong>
              <small>
                {product.prices.length > 1
                  ? `Compare ${product.prices.length} stores`
                  : "1 verified price"}
              </small>
            </div>
          </Link>
          <SaveProductButton product={product} />
        </article>
      ))}
    </div>
  );
}
