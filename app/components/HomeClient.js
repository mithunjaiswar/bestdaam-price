"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import LatestOfferRail from "./LatestOfferRail";

const PRODUCT_REQUEST_URL =
  process.env.NEXT_PUBLIC_PRODUCT_REQUEST_URL ||
  "https://script.google.com/macros/s/AKfycbwAtwt08dqP0Hx2QonKSrJITCR_CxIKY_FUZmjn_qJUabK_1ueIxuG0xwESbwa5TSH0/exec";

const CATEGORY_GROUPS = [
  {
    id: "electronics",
    label: "Electronics",
    icon: "smartphone",
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
    icon: "shirt",
    categories: ["Men's Clothing"],
  },
  {
    id: "office-more",
    label: "Office & More",
    icon: "pencil",
    categories: ["Stationery", "Requested Products"],
  },
];

const CATEGORY_ICONS = {
  Camera: "camera",
  Earbuds: "headphones",
  Headphones: "headphones",
  iPhone: "smartphone",
  Laptop: "laptop",
  Mobile: "smartphone",
  "Men's Clothing": "shirt",
  "Requested Products": "plus",
  "Samsung Buds": "headphones",
  Smartwatch: "watch",
  Speaker: "speaker",
  Stationery: "pencil",
  Tablet: "tablet",
  Television: "television",
  "Wired Earphones": "earphones",
};

function CategoryIcon({ name }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
  };

  const paths = {
    all: <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13.5" r="3.2" /></>,
    earphones: <><path d="M7 17V9a5 5 0 0 1 10 0v8" /><path d="M7 13H5v5h3v-4M17 13h2v5h-3v-4" /></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z" /></>,
    laptop: <><rect x="5" y="5" width="14" height="10" rx="1.5" /><path d="M3 18h18M9 18h6" /></>,
    pencil: <><path d="m5 19 1-4L16 5l3 3L9 18z" /><path d="m14.5 6.5 3 3M6 15l3 3" /></>,
    plus: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></>,
    shirt: <><path d="m8 5-4 2-2 5 4 2v6h12v-6l4-2-2-5-4-2a4.5 4.5 0 0 1-8 0Z" /></>,
    smartphone: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M10 6h4M11 18h2" /></>,
    speaker: <><path d="M5 10v4h4l5 4V6L9 10z" /><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /></>,
    tablet: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="18" r=".5" /></>,
    television: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m9 3 3 3 3-3M9 21h6" /></>,
    watch: <><path d="M9 2h6l1 4H8zM8 18h8l-1 4H9z" /><rect x="7" y="6" width="10" height="12" rx="3" /><path d="M12 9v3l2 1" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {paths[name] || paths.all}
    </svg>
  );
}

function findGroupForCategory(category) {
  return (
    CATEGORY_GROUPS.find((group) => group.categories.includes(category))?.id ||
    "all"
  );
}

export default function HomeClient({
  products,
  latestOffers = [],
  initialFilters = {},
}) {
  const router = useRouter();
  const initialQuery = initialFilters.query || "";
  const initialCategory = initialFilters.category || "All";
  const initialGroup =
    initialFilters.group || findGroupForCategory(initialCategory);
  const initialStore = initialFilters.store || "All";
  const initialBudget = initialFilters.budget || "all";
  const initialSort = initialFilters.sort || "price-low-high";
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
  const flipkartSearchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchLabel)}`;
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

  function openFlipkartSearch() {
    trackEvent("outbound_store_click", {
      store: "Flipkart",
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
        source: "pricevichar.com",
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
          Prices checked daily
        </div>
        <h1>
          Search. Compare. Think.
          <span> Buy better.</span>
        </h1>
        <p>
          Everything you need to make a smarter choice—right here on
          PriceVichar.
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

        {!hasQuery ? <LatestOfferRail offers={latestOffers} /> : null}

        <section className="category-browser" aria-labelledby="category-heading">
          <div className="category-heading-row">
            <div>
              <h2 id="category-heading"><span>Shop by category</span></h2>
            </div>
            <span>Select a category to explore</span>
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
              <span className="category-group-icon"><CategoryIcon name="all" /></span>
              <strong>All products</strong>
            </button>

            {availableCategoryGroups.map((group) => {
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
                    <CategoryIcon name={group.icon} />
                  </span>
                  <strong>{group.label}</strong>
                </button>
              );
            })}

            <Link
              href="/deals#limited-time-offers"
              className="category-group-card category-offer-link"
              aria-label="View limited-time partner offers"
            >
              <span className="category-group-icon category-offer-icon" aria-hidden="true">
                <img src="/icons/limited-time-offers.png" alt="" />
              </span>
              <strong>Limited-time offers</strong>
            </Link>
          </div>

          {activeCategoryGroup ? (
            <div className="subcategory-panel">
              <span className="subcategory-label">
                Explore {activeCategoryGroup.label}
              </span>
              <div className="subcategory-row">
                <button
                  type="button"
                  className={`subcategory-chip subcategory-all ${
                    selectedCategory === "All" ? "active" : ""
                  }`}
                  onClick={() => setCategory("All")}
                >
                  <span>All</span>
                  <strong>All {activeCategoryGroup.label}</strong>
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
                    <span><CategoryIcon name={CATEGORY_ICONS[item] || "all"} /></span>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

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
              <span className="flipkart-request-kicker">Search or request</span>
              <strong>Find “{searchLabel}” on Flipkart</strong>
              <p>
                Search Flipkart directly now, or request the product so we can
                verify and add it to PriceVichar.
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
            <div className="flipkart-search-actions">
              <a
                href={flipkartSearchUrl}
                className="buy-btn flipkart-direct-search-btn"
                target="_blank"
                rel="nofollow noopener"
                onClick={openFlipkartSearch}
              >
                Search Flipkart ↗
              </a>
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
                    : "Request this product"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {!hasQuery &&
      selectedCategory === "All" &&
      selectedStore === "All" &&
      selectedBudget === "all" ? (
        <section className="amazon-growth-banner" aria-labelledby="amazon-growth-title">
          <div>
            <span className="results-kicker">Useful shopping shortcuts</span>
            <h2 id="amazon-growth-title">Explore popular needs on Amazon</h2>
            <p>
              Start with curated search ideas, then confirm the exact product,
              seller and final price on Amazon India.
            </p>
          </div>
          <Link
            href="/amazon-deals?utm_source=pricevichar&utm_medium=website&utm_campaign=amazon_10_sales"
            className="buy-btn amazon-search-btn"
          >
            Explore Amazon picks →
          </Link>
        </section>
      ) : null}

      {!hasQuery &&
      selectedCategory === "All" &&
      selectedStore === "All" &&
      selectedBudget === "all" ? (
        <section className="featured-deals-section trending-section homepage-slider-section">
          <div className="section-heading-row">
            <div>
              <span className="results-kicker">Shopping pulse</span>
              <h2>Trending this week</h2>
              <p className="section-subtitle">
                Popularity signals from Flipkart and PriceVichar shopper activity.
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
        <section className="featured-deals-section homepage-slider-section">
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
