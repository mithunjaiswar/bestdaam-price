import { getAllProducts } from "../lib/products";

const BASE = "https://bestdaam.in";

export default function sitemap() {
  const staticPages = ["", "/about", "/privacy", "/disclosure"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));

  const productPages = getAllProducts().map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}
