import { HeroSection } from "@/features/marketing/components/hero-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { CTASection } from "@/features/marketing/components/cta-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Tracker - Your Wealth, One Dashboard",
  description:
    "Track your entire portfolio – stocks, crypto, and bank accounts – in one beautiful dashboard. Real-time updates, AI insights, and bank-level security.",
  keywords: [
    "portfolio tracker",
    "investment tracking",
    "net worth",
    "crypto portfolio",
    "stock tracker",
  ],
  openGraph: {
    title: "Portfolio Tracker - Your Wealth, One Dashboard",
    description:
      "Track your entire portfolio in one beautiful dashboard. Real-time updates and AI insights.",
    type: "website",
  },
};

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
