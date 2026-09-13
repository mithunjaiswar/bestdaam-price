"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatINR, getLowestPrice } from "../../lib/helpers";
import {
  getSavedProductIds,
  SAVED_PRODUCTS_EVENT,
} from "../../lib/saved-products";
import { searchProducts } from "../../lib/search";
import styles from "./SavedProductsClient.module.css";
import SaveProductButton from "./SaveProductButton";

export default function SavedProductsClient({ products }) {
  const [savedIds, setSavedIds] = useState([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    const refresh = () => {
      setSavedIds(getSavedProductIds());
      setReady(true);
    };

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

  const visibleProducts = searchProducts(savedProducts, query).filter((product) => {
    const price = getLowestPrice(product);
    return !budget || (price > 0 && price <= Number(budget));
  });
  if (sort === "recent") {
    visibleProducts.sort((a, b) => savedIds.indexOf(b.id) - savedIds.indexOf(a.id));
  } else {
    visibleProducts.sort((a, b) => {
      const left = getLowestPrice(a);
      const right = getLowestPrice(b);
      if (!left) return right ? 1 : 0;
      if (!right) return -1;
      return sort === "low" ? left - right : right - left;
    });
  }

  function resetFilters() {
    setQuery("");
    setBudget("");
    setSort("recent");
  }

  if (!ready) return <p role="status">Loading your saved products…</p>;

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
    <>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          Search your saved products
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product name or link" />
        </label>
        <label>
          Budget per product
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="">Any budget</option>
            {[500, 1000, 2000, 5000, 10000, 25000, 50000].map((amount) => (
              <option key={amount} value={amount}>Up to {formatINR(amount)}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recent">Recently saved</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className={styles.summary}>
        <p role="status">{visibleProducts.length} of {savedProducts.length} saved products</p>
        {(query || budget || sort !== "recent") && <button type="button" onClick={resetFilters}>Reset filters</button>}
      </div>
      <p className={styles.note}>Saved on this browser. Prices are recorded catalog prices; confirm the latest price and availability at the store.</p>
      {visibleProducts.length === 0 && (
        <div className="saved-empty">
          <h2>No saved products match</h2>
          <p>Try another search or a higher budget. Your saved products are still here.</p>
          <button type="button" className="buy-btn" onClick={resetFilters}>Show all saved products</button>
        </div>
      )}
      <div className="saved-grid">
      {visibleProducts.map((product) => (
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
              <p>Lowest recorded price</p>
              <strong>{getLowestPrice(product) ? formatINR(getLowestPrice(product)) : "Price unavailable"}</strong>
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
    </>
  );
}
