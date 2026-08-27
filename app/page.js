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

export default async function HomePage({ searchParams }) {
  const products = await fetchProducts();
  const latestOffers = getCurrentEarnKaroOffers().slice(0, 8);
  const params = await searchParams;
  const initialFilters = {
    query: typeof params?.q === "string" ? params.q : "",
    category: typeof params?.category === "string" ? params.category : "All",
    group: typeof params?.group === "string" ? params.group : "",
    store: typeof params?.store === "string" ? params.store : "All",
    budget: typeof params?.budget === "string" ? params.budget : "all",
    sort: typeof params?.sort === "string" ? params.sort : "price-low-high",
  };

  return (
    <HomeClient
      products={products}
      latestOffers={latestOffers}
      initialFilters={initialFilters}
    />
  );
}
