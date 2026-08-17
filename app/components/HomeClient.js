"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCategories,
  getLowestPrice,
  getAmazonSearchUrl,
  formatINR,
} from "../../lib/helpers";
import {
  getSearchLabel,
  searchProducts,
} from "../../lib/search";
import { getFeaturedDeals } from "../../lib/deals";
import { getTrendingProducts } from "../../lib/trending";
import { trackEvent } from "../../lib/tracking";
import DealGrid from "./DealGrid";
import TrendingGrid from "./TrendingGrid";
import SaveProductButton from "./SaveProductButton";

const PRODUCT_REQUEST_URL =
  process.env.NEXT_PUBLIC_PRODUCT_REQUEST_URL ||
  "https://script.google.com/macros/s/AKfycbwAtwt08dqP0Hx2QonKSrJITCR_CxIKY_FUZmjn_qJUabK_1ueIxuG0xwESbwa5TSH0/exec";

const CATEGORY_GROUPS = [
  {
    id: "electronics",
    label: "Electronics",
    icon: "⚡",
    categories: [
      "Mobile",
      "iPhone",
      "Laptop",
      "Tablet",
      "Television",
      "Camera",
      "Smartwatch",
      "Speaker",
      "Headphones",
      "Earbuds",
      "Wired Earphones",
      "Samsung Buds",
    ],
  },
  {
    id: "fashion",
    label: "Fashion",
    icon: "👕",
    categories: ["Men's Clothing"],
  },
  {
    id: "office-more",
    label: "Office & More",
    icon: "✏️",
    categories: ["Stationery", "Requested Products"],
  },
];

const CATEGORY_ICONS = {
  Camera: "📷",
  Earbuds: "🎧",
  Headphones: "🎧",
  iPhone: "📱",
  Laptop: "💻",
  Mobile: "📱",
  "Men's Clothing": "👔",
  "Requested Products": "＋",
  "Samsung Buds": "🎧",
  Smartwatch: "⌚",
  Speaker: "🔊",
  Stationery: "✏️",
  Tablet: "▣",
  Television: "📺",
  "Wired Earphones": "🎵",
};

function findGroupForCategory(category) {
  return (
    CATEGORY_GROUPS.find((group) => group.categories.includes(category))?.id ||
    "all"
  );
}

export default function HomeClient({ products }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialGroup =
    searchParams.get("group") || findGroupForCategory(initialCategory);
  const initialStore = searchParams.get("store") || "All";
  const initialBudget = searchParams.get("budget") || "all";
  const initialSort = searchParams.get("sort") || "price-low-high";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [categoryGroup, setCategoryGroup] = useState(initialGroup);
  const [store, setStore] = useState(initialStore);
  const [budget, setBudget] = useState(initialBudget);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [requestState, setRequestState] = useState("idle");
  const restoredScroll = useRef(false);

  const categories = ["All", ...getCategories(products)];
  const categoryCounts = products.reduce((counts, product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});
  const availableCategoryGroups = CATEGORY_GROUPS.map((group) => ({
    ...group,
    categories: group.categories.filter((item) => categories.includes(item)),
  })).filter((group) => group.categories.length > 0);
  const stores = [
    "All",
    ...Array.from(
      new Set(
        products.flatMap((product) =>
          (product.prices || []).map((entry) => entry.store).filter(Boolean)
        )
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];
  const selectedCategory = categories.includes(category) ? category : "All";
  const selectedCategoryGroup =
    availableCategoryGroups.some((group) => group.id === categoryGroup)
      ? categoryGroup
      : findGroupForCategory(selectedCategory);
  const activeCategoryGroup = availableCategoryGroups.find(
    (group) => group.id === selectedCategoryGroup
  );
  const selectedStore = stores.includes(store) ? store : "All";
  const selectedBudget = [
    "all",
    "under-500",
    "under-1000",
    "under-5000",
    "5000-20000",
    "above-20000",
  ].includes(budget)
    ? budget
    : "all";
  const hasQuery = query.trim().length > 0;

  const priceForSelectedStore = (product) => {
    if (selectedStore === "All") {
      return getLowestPrice(product);
    }

    const storePrices = (product.prices || [])
      .filter((entry) => entry.store === selectedStore)
      .map((entry) => entry.price)
      .filter((price) => typeof price === "number" && price > 0);

    return storePrices.length ? Math.min(...storePrices) : getLowestPrice(product);
  };

  const searchedResults = searchProducts(products, query);
  const filteredResults = searchedResults.filter((p) => {
    const matchesCategory =
      hasQuery ||
      (selectedCategory === "All" && selectedCategoryGroup === "all") ||
      (selectedCategory !== "All" && p.category === selectedCategory) ||
      (selectedCategory === "All" &&
        activeCategoryGroup?.categories.includes(p.category));
    const matchesStore =
      selectedStore === "All" ||
      (p.prices || []).some((entry) => entry.store === selectedStore);
    const productPrice = priceForSelectedStore(p);
    const matchesBudget =
      selectedBudget === "all" ||
      (selectedBudget === "under-500" && productPrice <= 500) ||
      (selectedBudget === "under-1000" && productPrice <= 1000) ||
      (selectedBudget === "under-5000" && productPrice <= 5000) ||
      (selectedBudget === "5000-20000" &&
        productPrice > 5000 &&
        productPrice <= 20000) ||
      (selectedBudget === "above-20000" && productPrice > 20000);
    return matchesCategory && matchesStore && matchesBudget;
  });
  const selectedSort = [
    "default",
    "price-low-high",
    "price-high-low",
  ].includes(sortOrder)
    ? sortOrder
    : "price-low-high";
  const results = [...filteredResults];

  if (selectedSort === "price-low-high") {
    results.sort((a, b) => priceForSelectedStore(a) - priceForSelectedStore(b));
  } else if (selectedSort === "price-high-low") {
    results.sort((a, b) => priceForSelectedStore(b) - priceForSelectedStore(a));
  }
  const missingProduct = hasQuery && searchedResults.length === 0;
  const emptyStoreResults = !missingProduct && results.length === 0;
  const searchLabel = getSearchLabel(query);
  const amazonSearchUrl = getAmazonSearchUrl({ name: searchLabel });
  const requestEndpoint = PRODUCT_REQUEST_URL;
  const featuredDeals = getFeaturedDeals(products, 8);
  const trendingProducts = getTrendingProducts(products, "week", 10);

  useEffect(() => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    }

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    } else if (selectedCategoryGroup !== "all") {
      params.set("group", selectedCategoryGroup);
    }

    if (selectedStore !== "All") {
      params.set("store", selectedStore);
    }

    if (selectedBudget !== "all") {
      params.set("budget", selectedBudget);
    }

    if (selectedSort !== "price-low-high") {
      params.set("sort", selectedSort);
    }

    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    query,
    router,
    selectedBudget,
    selectedCategory,
    selectedCategoryGroup,
    selectedSort,
    selectedStore,
  ]);

  useEffect(() => {
    if (restoredScroll.current) {
      return;
    }

    restoredScroll.current = true;
    const savedScroll = Number(
      window.sessionStorage.getItem("bestdaam-home-scroll")
    );

    if (!Number.isFinite(savedScroll) || savedScroll <= 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedScroll, behavior: "auto" });
      });
    });
  }, []);

  function rememberHomePosition() {
    window.sessionStorage.setItem(
      "bestdaam-home-scroll",
      String(window.scrollY)
    );
    window.sessionStorage.setItem(
      "bestdaam-home-url",
      `${window.location.pathname}${window.location.search}`
    );
  }

  function submitSearch() {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    trackEvent("search", {
      query: normalizedQuery,
      value: searchedResults.length,
    });
  }

  function openAmazonSearch() {
    trackEvent("outbound_store_click", {
      store: "Amazon",
      source: "search_companion",
      query: query.trim(),
    });
  }

  async function requestProduct() {
    if (!requestEndpoint || requestState === "sending") {
      return;
    }

    setRequestState("sending");

    try {
      const body = new URLSearchParams({
        action: "submit",
        query: query.trim(),
        label: searchLabel,
        source: "bestdaam.in",
        website: "",
      });

      await fetch(requestEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      setRequestState("sent");
    } catch {
      setRequestState("error");
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="status-dot" />
          Prices refreshed daily
        </div>
        <h1>
          Find the best price.
          <span> Before you buy.</span>
        </h1>
        <p>
          Search once, compare trusted stores, and shop with confidence.
          BestDaam makes every deal easier to understand.
        </p>

        <div className="search-shell">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="search-box"
            placeholder="Search by product name or paste a product link"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRequestState("idle");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitSearch();
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className="search-hint"
            onClick={submitSearch}
          >
            Search
          </button>
        </div>

        <div className="quick-searches">
          <span>Quick searches</span>
          {["Wired Earphones", "Earbuds", "Speakers", "Smartwatch"].map(
            (term) => (
              <button
                type="button"
                key={term}
                onClick={() => {
                  setQuery(term);
                  trackEvent("search", { query: term });
                }}
              >
                {term}
              </button>
            )
          )}
        </div>

        <section className="category-browser" aria-labelledby="category-heading">
          <div className="category-heading-row">
            <div>
              <span className="category-eyebrow">Browse faster</span>
              <h2 id="category-heading">Shop by category</h2>
            </div>
            <span>Choose a section, then narrow it down</span>
          </div>

          <div className="category-groups">
            <button
              type="button"
              className={`category-group-card ${
                selectedCategoryGroup === "all" ? "active" : ""
              }`}
              aria-pressed={selectedCategoryGroup === "all"}
              onClick={() => {
                setCategoryGroup("all");
                setCategory("All");
              }}
            >
              <span className="category-group-icon" aria-hidden="true">✦</span>
              <span>
                <strong>All products</strong>
                <small>{products.length.toLocaleString("en-IN")} items</small>
              </span>
            </button>

            {availableCategoryGroups.map((group) => {
              const groupCount = group.categories.reduce(
                (total, item) => total + (categoryCounts[item] || 0),
                0
              );
              const isActive = selectedCategoryGroup === group.id;

              return (
                <button
                  type="button"
                  key={group.id}
                  className={`category-group-card ${isActive ? "active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    setCategoryGroup(group.id);
                    setCategory("All");
                  }}
                >
                  <span className="category-group-icon" aria-hidden="true">
                    {group.icon}
                  </span>
                  <span>
                    <strong>{group.label}</strong>
                    <small>{groupCount.toLocaleString("en-IN")} items</small>
                  </span>
                </button>
              );
            })}
          </div>

          {activeCategoryGroup ? (
            <div className="subcategory-panel">
              <span className="subcategory-label">
                {activeCategoryGroup.label} categories
              </span>
              <div className="subcategory-row">
                <button
                  type="button"
                  className={`subcategory-chip ${
                    selectedCategory === "All" ? "active" : ""
                  }`}
                  onClick={() => setCategory("All")}
                >
                  All {activeCategoryGroup.label}
                </button>
                {activeCategoryGroup.categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`subcategory-chip ${
                      selectedCategory === item ? "active" : ""
                    }`}
                    onClick={() => setCategory(item)}
                  >
                    <span aria-hidden="true">{CATEGORY_ICONS[item] || "•"}</span>
                    {item}
                    <small>{categoryCounts[item] || 0}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="budget-row" aria-label="Quick budget filters">
          <span>Shop by budget</span>
          {[
            ["under-500", "Under ₹500"],
            ["under-1000", "Under ₹1,000"],
            ["under-5000", "Under ₹5,000"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`budget-chip ${selectedBudget === value ? "active" : ""}`}
              onClick={() =>
                setBudget(selectedBudget === value ? "all" : value)
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="results-toolbar">
          <div>
            <span className="results-kicker">Explore our catalog</span>
            <p>{results.length.toLocaleString("en-IN")} products found</p>
          </div>
          <div className="filter-controls">
            <label className="sort-control">
              <span>Budget</span>
              <select
                value={selectedBudget}
                onChange={(event) => setBudget(event.target.value)}
                aria-label="Filter products by budget"
              >
                <option value="all">All prices</option>
                <option value="under-500">Under ₹500</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="under-5000">Under ₹5,000</option>
                <option value="5000-20000">₹5,000–₹20,000</option>
                <option value="above-20000">Above ₹20,000</option>
              </select>
            </label>
            <label className="sort-control">
              <span>Store</span>
              <select
                value={selectedStore}
                onChange={(event) => setStore(event.target.value)}
                aria-label="Filter products by store"
              >
                {stores.map((storeName) => (
                  <option key={storeName} value={storeName}>
                    {storeName === "All" ? "All stores" : storeName}
                  </option>
                ))}
              </select>
            </label>
            <label className="sort-control">
              <span>Sort by</span>
              <select
                value={selectedSort}
                onChange={(event) => setSortOrder(event.target.value)}
                aria-label="Sort products"
              >
                <option value="default">Catalog order</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {hasQuery ? (
        <div className="external-search-options">
          <aside className="amazon-search-companion" aria-label="Search on Amazon">
            <div className="amazon-search-companion-copy">
              <span className="amazon-search-companion-kicker">Want more options?</span>
              <strong>Search Amazon for “{searchLabel}”</strong>
              <p>
                Open the same search directly on Amazon India. Prices and product
                availability will be shown by Amazon.
              </p>
            </div>
            <a
              href={amazonSearchUrl}
              className="buy-btn amazon-search-btn amazon-search-companion-btn"
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={openAmazonSearch}
            >
              Search on Amazon ↗
            </a>
          </aside>

          <aside className="flipkart-request-companion" aria-label="Request on Flipkart">
            <div className="amazon-search-companion-copy">
              <span className="flipkart-request-kicker">Can&apos;t find the right match?</span>
              <strong>Request “{searchLabel}” for Flipkart</strong>
              <p>
                Send us this search once. We&apos;ll try to verify and add a matching
                Flipkart listing to BestDaam.
              </p>
              {requestState === "sent" ? (
                <p className="request-status success">
                  Request received. We&apos;ll process it through the product queue.
                </p>
              ) : null}
              {requestState === "error" ? (
                <p className="request-status error">
                  We could not save the request. Please try again shortly.
                </p>
              ) : null}
              {!requestEndpoint ? (
                <p className="request-status error">
                  Product requests are temporarily unavailable.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="request-product-btn flipkart-request-btn"
              onClick={requestProduct}
              disabled={!requestEndpoint || requestState === "sending" || requestState === "sent"}
            >
              {requestState === "sending"
                ? "Saving request…"
                : requestState === "sent"
                  ? "Request saved ✓"
                  : "Request on Flipkart"}
            </button>
          </aside>
        </div>
      ) : null}

      {!hasQuery &&
      selectedCategory === "All" &&
      selectedStore === "All" &&
      selectedBudget === "all" ? (
        <section className="featured-deals-section trending-section">
          <div className="section-heading-row">
            <div>
              <span className="results-kicker">Shopping pulse</span>
              <h2>Trending this week</h2>
              <p className="section-subtitle">
                Popularity signals from Flipkart and BestDaam shopper activity.
              </p>
            </div>
            <Link href="/trending" className="text-link">
              See full ranking →
            </Link>
          </div>
          <TrendingGrid products={trendingProducts} />
        </section>
      ) : null}

      {!hasQuery &&
      selectedCategory === "All" &&
      selectedStore === "All" &&
      selectedBudget === "all" ? (
        <section className="featured-deals-section">
          <div className="section-heading-row">
            <div>
              <span className="results-kicker">Affordable picks</span>
              <h2>Today&apos;s deals</h2>
            </div>
            <Link href="/deals" className="text-link">
              View all deals →
            </Link>
          </div>
          <DealGrid products={featuredDeals} />
        </section>
      ) : null}

      {missingProduct ? (
        <div className="no-results missing-product">
          <span className="empty-icon">⌕</span>
          <h2>We could not find this product yet</h2>
          <p>
            Use the Amazon search or Flipkart request options above. We will try
            to include a verified listing in an upcoming catalog update.
          </p>
        </div>
      ) : emptyStoreResults ? (
        <div className="no-results">
          <span className="empty-icon">⌕</span>
          <h2>No products available for these filters</h2>
          <p>Try selecting another store or category.</p>
        </div>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <article key={p.id} className="card card-with-save">
              <SaveProductButton product={p} compact />
              <Link
                href={`/product/${p.id}`}
                className="card-main-link"
                onClick={() => {
                  rememberHomePosition();
                  trackEvent("select_product", {
                    productId: p.id,
                    productName: p.name,
                    category: p.category,
                    value: priceForSelectedStore(p),
                  });
                }}
              >
                <div className="card-media">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="emoji">{p.emoji}</div>
                  )}
                </div>

                <span className="card-category">{p.category}</span>
                <h3>{p.name}</h3>

                <div className="from">Best available price</div>

                <div className="price">
                  {formatINR(priceForSelectedStore(p))}
                  {selectedStore === "All" && p.prices.length > 1
                    ? " onwards"
                    : ""}
                </div>

                <div className="stores">
                  {selectedStore !== "All"
                    ? `Available on ${selectedStore}`
                    : p.prices.length > 1
                    ? `Compare across ${p.prices.length} stores`
                    : "1 verified price"}
                </div>
                <div className="card-cta">
                  Compare prices <span aria-hidden="true">→</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
