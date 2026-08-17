import { fetchProducts } from "../../lib/products";
import SavedProductsClient from "../components/SavedProductsClient";

export const metadata = {
  title: "Saved Products | PriceVichar",
  description:
    "Review the products you saved and return anytime to compare their latest available prices.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SavedProductsPage() {
  const products = await fetchProducts();

  return (
    <section className="saved-page">
      <div className="saved-page-heading">
        <span className="results-kicker">Your watchlist</span>
        <h1>Saved products</h1>
        <p>
          Keep products here while you decide. Revisit them to compare the
          latest available prices.
        </p>
      </div>
      <SavedProductsClient products={products} />
    </section>
  );
}
