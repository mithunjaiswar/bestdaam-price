import Recommendations from "../components/Recommendations";

export const metadata = {
  title: "Shop Our Instagram & YouTube Picks | PriceVichar",
  description: "Find the exact products featured in PriceVichar videos and shop directly on Amazon India.",
  alternates: { canonical: "/recommendations" },
  openGraph: {
    title: "Shop PriceVichar video picks",
    description: "Seen our reel? Find the product and shop on Amazon.",
    url: "https://pricevichar.com/recommendations",
    images: [{ url: "/recommendations/non-piercing-hoops.jpg", width: 540, height: 960 }],
  },
};

export default function RecommendationsPage() {
  return <Recommendations />;
}
