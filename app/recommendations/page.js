import Recommendations from "../components/Recommendations";

export const metadata = {
  title: "Recommended by PriceVichar | Product Picks & Details",
  description: "Explore products recommended by PriceVichar, read their details and shop directly on Amazon India.",
  alternates: { canonical: "/recommendations" },
  openGraph: {
    title: "Recommended by PriceVichar",
    description: "Product photos, details and direct Amazon shopping links.",
    url: "https://pricevichar.com/recommendations",
    images: [{ url: "https://m.media-amazon.com/images/I/41CqguoN1PL._SY695_.jpg" }],
  },
};

export default function RecommendationsPage() {
  return <Recommendations />;
}
