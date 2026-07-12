import { fetchProducts } from "../lib/products";
import HomeClient from "./components/HomeClient";

export const revalidate = 600;

export default async function HomePage() {
  const products = await fetchProducts();
  return <HomeClient products={products} />;
}
