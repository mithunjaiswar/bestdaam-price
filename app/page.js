import { Suspense } from "react";
import { fetchProducts } from "../lib/products";
import { getCurrentEarnKaroOffers } from "../lib/earnkaro-offers";
import HomeClient from "./components/HomeClient";

export const revalidate = 600;

export const metadata = {
  title: "PriceVichar — Compare Product Prices Across Indian Stores",
  description:
    "Compare current prices for mobiles, laptops, electronics, fashion and more across trusted Indian online stores.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const products = await fetchProducts();
  const latestOffers = getCurrentEarnKaroOffers().slice(0, 8);

  return (
    <Suspense fallback={<p className="loading-state">Loading the latest prices…</p>}>
      <HomeClient products={products} latestOffers={latestOffers} />
    </Suspense>
  );
}
