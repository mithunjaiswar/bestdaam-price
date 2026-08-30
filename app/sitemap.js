import { fetchProducts } from "../lib/products";
import { BUDGET_PAGES } from "../lib/deals";
import { getCategories } from "../lib/helpers";
import { slugify } from "../lib/slugs";
import { BUYING_GUIDES } from "../lib/guides";

const BASE = "https://pricevichar.com";

export default async function sitemap() {
  const staticPages = ["", "/about", "/privacy", "/disclosure", "/deals", "/amazon-deals", "/trending", "/guides", "/start"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));

  const products = await fetchProducts();
  const productPages = products.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: p.lastUpdated ? new Date(p.lastUpdated) : new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));
  const budgetPages = Object.keys(BUDGET_PAGES).map((budget) => ({
    url: `${BASE}/deals/${budget}`,
    lastModified: new Date(),
  }));
  const categoryPages = getCategories(products).map((category) => ({
    url: `${BASE}/category/${slugify(category)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));
  const guidePages = Object.keys(BUYING_GUIDES).map((slug) => ({
    url: `${BASE}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...staticPages, ...budgetPages, ...categoryPages, ...guidePages, ...productPages];
}
