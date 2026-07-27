import { fetchProducts } from "../lib/products";
import { BUDGET_PAGES } from "../lib/deals";
import { getCategories } from "../lib/helpers";
import { slugify } from "../lib/slugs";

const BASE = "https://bestdaam.in";

export default async function sitemap() {
  const staticPages = ["", "/about", "/privacy", "/disclosure", "/deals", "/trending"].map((p) => ({
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

  return [...staticPages, ...budgetPages, ...categoryPages, ...productPages];
}
