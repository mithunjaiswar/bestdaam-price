import { fetchProducts } from "../lib/products";

const BASE = "https://bestdaam.in";

export default async function sitemap() {
  const staticPages = ["", "/about", "/privacy", "/disclosure"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));

  const products = await fetchProducts();
  const productPages = products.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}
