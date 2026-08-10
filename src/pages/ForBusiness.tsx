import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoalBuilder from "@/components/growth/GoalBuilder";
import PageHero from "@/components/growth/PageHero";
import {
  CtaLink,
  FinalCtaSection,
  GrowthFaqSection,
  HowItWorksSection,
  PlansBuiltAroundGoalSection,
} from "@/components/growth/sections";
import { businessGoals } from "@/data/growth";
import { fadeUp, revealViewport } from "@/lib/motion";
import { ArrowRight, Target } from "lucide-react";

const ForBusiness = () => (
  <div className="min-h-screen bg-white text-[#111827]">
    <Header />

    <PageHero
      eyebrow="For business"
      title={
        <>
          Growth Plans Built for{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            Your Business
          </span>
        </>
      }
      description="Whether you want to build a stronger local audience, expand into a new market or increase your brand visibility, TrendK creates a social growth strategy around your business goals."
    >
      <CtaLink to="#goal-builder">
        <Button
          size="lg"
          className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
        >
          Build a Business Growth Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CtaLink>
    </PageHero>

    <motion.section
      className="bg-white py-16"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businessGoals.map((goal, index) => (
            <motion.div key={goal} variants={fadeUp} custom={index * 0.05}>
              <Card className="h-full rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_16px_40px_rgba(15,23,42,0.04)] card-hover">
                <CardContent className="flex items-start gap-3 p-6">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Target className="h-4 w-4 text-[#2563EB]" />
                  </span>
                  <p className="text-sm leading-6 text-slate-600">{goal}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>

    <motion.section
      className="bg-white pb-16"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp}>
          <GoalBuilder
            variant="business"
            eyebrow="Business goal builder"
            title="Tell us about your business goal"
            subtitle="A few short steps. We'll come back with a strategy, timeline and proposal."
            submitLabel="Build My Business Plan"
          />
        </motion.div>
      </div>
    </motion.section>

    <HowItWorksSection />
    <PlansBuiltAroundGoalSection />
    <GrowthFaqSection />
    <FinalCtaSection />

    <Footer />
  </div>
);

export default ForBusiness;
