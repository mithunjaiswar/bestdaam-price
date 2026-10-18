import { notFound } from "next/navigation";
import picks from "../../../data/recommendations.json";
import Recommendations from "../../components/Recommendations";

export function generateStaticParams() {
  return picks.map((pick) => ({ id: pick.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const pick = picks.find((item) => item.id === id);
  if (!pick) return {};
  return {
    title: `${pick.name} — ${pick.brand} | PriceVichar`,
    description: pick.description,
    alternates: { canonical: `/recommendations/${pick.id}` },
    openGraph: { title: pick.name, description: pick.description, url: `https://pricevichar.com/recommendations/${pick.id}`, images: [{ url: pick.image }] },
  };
}

export default async function RecommendationDetailPage({ params }) {
  const { id } = await params;
  if (!picks.some((pick) => pick.id === id)) notFound();
  return <Recommendations productId={id} />;
}
