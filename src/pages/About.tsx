import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/growth/PageHero";
import {
  FinalCtaSection,
  GrowthFaqSection,
  PersonalizedApproachSection,
  WhyTrendkSection,
} from "@/components/growth/sections";

const About = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <Header />

    <PageHero
      eyebrow="About TrendK"
      title={
        <>
          Growth built around{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            your account
          </span>
        </>
      }
      description="TrendK is a personalized social media growth service for creators and businesses. You tell us your current position and your growth goal, and our team builds a strategy around your account."
    />

    <WhyTrendkSection />
    <PersonalizedApproachSection builderHref="/#goal-builder" />
    <GrowthFaqSection />
    <FinalCtaSection builderHref="/#goal-builder" />

    <Footer />
  </div>
);

export default About;
