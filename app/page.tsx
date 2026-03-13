import "@/components/landing/landing.css";
import Navbar from "@/components/layout/Navbar";
import WorldMapBg from "@/components/landing/WorldMapBg";
import HeroSection from "@/components/landing/HeroSection";
import NewsTicker from "@/components/landing/NewsTicker";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import EvaluationSection from "@/components/landing/EvaluationSection";
import StatsBar from "@/components/landing/StatsBar";
import BottomCTA from "@/components/landing/BottomCTA";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Fixed SVG world map background */}
      <WorldMapBg />

      {/* Content stack */}
      <HeroSection />
      <NewsTicker />
      <HowItWorks />
      <FeaturesSection />
      <EvaluationSection />
      <StatsBar />
      <BottomCTA />
    </div>
  );
}
