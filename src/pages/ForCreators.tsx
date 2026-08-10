import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import GoalBuilder from "@/components/growth/GoalBuilder";
import PageHero from "@/components/growth/PageHero";
import {
  CtaLink,
  ExamplePlansSection,
  FinalCtaSection,
  GrowthFaqSection,
  HowItWorksSection,
  PersonalizedApproachSection,
} from "@/components/growth/sections";
import { fadeUp, revealViewport } from "@/lib/motion";
import { ArrowRight } from "lucide-react";

const ForCreators = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <Header />

    <PageHero
      eyebrow="For creators"
      title={
        <>
          Take Your Audience to the{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            Next Level
          </span>
        </>
      }
      description="Tell us your current audience, where you want to go and what you create. TrendK will review your profile and build a personalized growth plan."
    >
      <CtaLink to="#goal-builder">
        <Button
          size="lg"
          className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
        >
          Build My Creator Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CtaLink>
    </PageHero>

    <motion.section
      className="bg-white py-14"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp}>
          <GoalBuilder
            variant="creator"
            eyebrow="Creator goal builder"
            title="Your goal. Your account. Your strategy."
            subtitle="Tell us what you create and where you want to take it."
            submitLabel="Build My Creator Plan"
          />
        </motion.div>
      </div>
    </motion.section>

    <HowItWorksSection />
    <PersonalizedApproachSection />
    <ExamplePlansSection />
    <GrowthFaqSection />
    <FinalCtaSection />

    <Footer />
  </div>
);

export default ForCreators;
