import { Suspense } from "react";
import { fetchProducts } from "../lib/products";
import HomeClient from "./components/HomeClient";

export const revalidate = 600;

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <Suspense fallback={<p className="loading-state">Products load ho rahe hain...</p>}>
      <HomeClient products={products} />
    </Suspense>
  );
}
