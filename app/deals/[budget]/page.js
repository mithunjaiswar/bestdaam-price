import { notFound } from "next/navigation";
import { fetchProducts } from "../../../lib/products";
import { BUDGET_PAGES, getBudgetProducts } from "../../../lib/deals";
import DealGrid from "../../components/DealGrid";

export const revalidate = 600;

export function generateStaticParams() {
  return Object.keys(BUDGET_PAGES).map((budget) => ({ budget }));
}

export function generateMetadata({ params }) {
  const budget = BUDGET_PAGES[params.budget];

  if (!budget) {
    return {};
  }

  return {
    title: `${budget.heading} | PriceVichar`,
    description: budget.description,
    alternates: { canonical: `/deals/${params.budget}` },
  };
}

export default async function BudgetDealsPage({ params }) {
  const budget = BUDGET_PAGES[params.budget];

  if (!budget) {
    notFound();
  }

  const products = await fetchProducts();
  const matches = getBudgetProducts(products, params.budget);

  return (
    <>
      <section className="landing-hero compact">
        <span className="landing-eyebrow">Shop by budget</span>
        <h1>{budget.heading}</h1>
        <p>{budget.description}</p>
      </section>
      <DealGrid products={matches} />
    </>
  );
}
