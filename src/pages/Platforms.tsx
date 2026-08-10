import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoalBuilder from "@/components/growth/GoalBuilder";
import PageHero from "@/components/growth/PageHero";
import {
  ExamplePlansSection,
  FinalCtaSection,
  PlansBuiltAroundGoalSection,
  SupportedPlatformsSection,
} from "@/components/growth/sections";
import { fadeUp, revealViewport } from "@/lib/motion";

const Platforms = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <Header />

    <PageHero
      eyebrow="Supported platforms"
      title={
        <>
          Growth built around{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            your platform
          </span>
        </>
      }
      description="Instagram, TikTok, YouTube, Facebook, X and LinkedIn. Same idea everywhere: you set the goal, we build the strategy around your account."
    />

    <SupportedPlatformsSection />

    <motion.section
      className="bg-white py-14"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp}>
          <GoalBuilder title="Set your platform goal" />
        </motion.div>
      </div>
    </motion.section>

    <ExamplePlansSection />
    <PlansBuiltAroundGoalSection />
    <FinalCtaSection />

    <Footer />
  </div>
);

export default Platforms;
