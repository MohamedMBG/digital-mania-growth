import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import GoalBuilder from "@/components/growth/GoalBuilder";
import PageHero from "@/components/growth/PageHero";
import {
  CtaLink,
  FinalCtaSection,
  GrowthFaqSection,
  HowItWorksSection,
  PersonalizedApproachSection,
  PlansBuiltAroundGoalSection,
} from "@/components/growth/sections";
import { fadeUp, revealViewport } from "@/lib/motion";
import { ArrowRight } from "lucide-react";

const HowItWorks = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <Header />

    <PageHero
      eyebrow="How it works"
      title={
        <>
          Your Goal.{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            Our Plan.
          </span>
        </>
      }
      description="Tell us where you want to go. We'll work out the path — starting with a real look at your account."
    >
      <CtaLink to="#goal-builder">
        <Button
          size="lg"
          className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
        >
          Build My Growth Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CtaLink>
    </PageHero>

    <HowItWorksSection />
    <PersonalizedApproachSection />

    <motion.section
      className="bg-white py-14"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp}>
          <GoalBuilder title="Start with your goal" />
        </motion.div>
      </div>
    </motion.section>

    <PlansBuiltAroundGoalSection />
    <GrowthFaqSection />
    <FinalCtaSection />

    <Footer />
  </div>
);

export default HowItWorks;
