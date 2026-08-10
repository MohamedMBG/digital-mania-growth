import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GoalBuilder from "@/components/growth/GoalBuilder";
import {
  CtaLink,
  ExamplePlansSection,
  FinalCtaSection,
  GrowthFaqSection,
  HowItWorksSection,
  PersonalizedApproachSection,
  PlansBuiltAroundGoalSection,
  SupportedPlatformsSection,
  WhyTrendkSection,
} from "@/components/growth/sections";
import { testimonials } from "@/data/services";
import { fadeUp, revealViewport } from "@/lib/motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  Compass,
  Instagram,
  Star,
  Target,
  UserRoundCheck,
} from "lucide-react";

const audienceTracks = [
  {
    title: "For Businesses",
    copy: "Build a stronger local audience, expand into a new market or increase brand visibility with a plan shaped around your business goals.",
    to: "/for-business",
    cta: "Build a Business Growth Plan",
    icon: Building2,
  },
  {
    title: "For Creators",
    copy: "Tell us your current audience, where you want to go and what you create. We'll review your profile and build a personalized growth plan.",
    to: "/for-creators",
    cta: "Build My Creator Plan",
    icon: UserRoundCheck,
  },
];

const Index = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <motion.section
        className="relative overflow-hidden bg-white pb-12 pt-20 md:pt-28"
        initial="hidden"
        animate="visible"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_70%)]" />
          <div className="absolute right-[-6%] top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)]" />
        </div>

        <div className="container relative">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div variants={fadeUp} custom={0} className="max-w-2xl">
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-white px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
              >
                Goal-based social growth
              </Badge>
              <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-[#111827] md:text-6xl xl:text-7xl">
                You Set the Goal.{" "}
                <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  We Build the Growth Plan.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Tell us where you want your social presence to go. TrendK analyzes
                your account and creates a personalized growth strategy built around
                your goals.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <Target className="h-4 w-4 text-[#2563EB]" />
                  Your goal, not a package
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <Compass className="h-4 w-4 text-[#7C3AED]" />
                  Strategy built per account
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <UserRoundCheck className="h-4 w-4 text-sky-500" />
                  Reviewed by our team
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <CtaLink to="#goal-builder">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
                  >
                    Build My Growth Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CtaLink>
                <CtaLink to="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[#111827] hover:bg-slate-50"
                  >
                    How It Works
                  </Button>
                </CtaLink>
              </div>

              <p className="mt-6 max-w-lg text-sm leading-6 text-slate-500">
                Your target is the objective we plan toward — never a guaranteed
                result.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={0.12} className="hero-stage relative">
              <div className="hero-depth-ring hero-depth-ring-one" />
              <div className="hero-depth-ring hero-depth-ring-two" />
              <div className="hero-depth-panel hero-depth-panel-back" />
              <div className="hero-depth-panel hero-depth-panel-mid" />
              <div className="hero-depth-main rounded-[2rem] border border-slate-200 bg-white p-4">
                <div className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Growth request
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                        Your goal, in motion
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      Example
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <motion.div
                      className="rounded-[1.5rem] border border-white bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.12 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#A855F7] text-white shadow-lg">
                          <Instagram className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">Instagram</p>
                          <p className="mt-1 text-xs text-slate-500">@yourbrand</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Now
                          </p>
                          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                            2,450
                          </p>
                        </div>
                        <ArrowRight className="mb-2 h-5 w-5 text-slate-300" />
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Goal
                          </p>
                          <p className="mt-2 bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-4xl font-semibold tracking-[-0.04em] text-transparent">
                            10,000
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[#F8FAFC]">
                        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-[linear-gradient(90deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)]" />
                        {!shouldReduceMotion && (
                          <motion.span
                            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.35)]"
                            initial={{ left: "0%" }}
                            animate={{ left: ["0%", "96%"] }}
                            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>

                    {[
                      { label: "Desired timeframe", value: "6 months", icon: Clock3 },
                      { label: "Next step", value: "Account review by TrendK", icon: Compass },
                    ].map((row, index) => (
                      <motion.div
                        key={row.label}
                        className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.22 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8FAFC]">
                            <row.icon className="h-4 w-4 text-[#2563EB]" />
                          </div>
                          <p className="text-sm text-slate-500">{row.label}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#111827]">{row.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hero-depth-chip hero-chip-one">
                <div className="flex items-center gap-3">
                  <div className="hero-depth-chip-icon">
                    <Target className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Objective
                    </p>
                    <p className="text-sm font-semibold text-[#111827]">Set by you</p>
                  </div>
                </div>
              </div>
              <div className="hero-depth-chip hero-chip-two">
                <div className="flex items-center gap-3">
                  <div className="hero-depth-chip-icon">
                    <Compass className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Strategy
                    </p>
                    <p className="text-sm font-semibold text-[#111827]">Built by TrendK</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white py-14 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="container">
          <motion.div variants={fadeUp}>
            <GoalBuilder
              title="Tell us where you want to go"
              subtitle="Six quick steps. No marketing terminology, no service menu."
            />
          </motion.div>
        </div>
      </motion.section>

      <HowItWorksSection />
      <WhyTrendkSection />
      <PersonalizedApproachSection />
      <SupportedPlatformsSection />
      <ExamplePlansSection />
      <PlansBuiltAroundGoalSection />

      <motion.section
        className="bg-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">
            {audienceTracks.map((track, index) => (
              <motion.div key={track.title} variants={fadeUp} custom={index * 0.08}>
                <Card className="h-full rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] card-hover">
                  <CardContent className="flex h-full flex-col p-8 md:p-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(124,58,237,0.10))]">
                      <track.icon className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                      {track.title}
                    </h3>
                    <p className="mt-4 flex-1 text-base leading-8 text-slate-600">
                      {track.copy}
                    </p>
                    <Link to={track.to} className="mt-7">
                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                      >
                        {track.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
      >
        <div className="container">
          <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Trusted by creators who care about quality
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeUp} custom={0.05 * index}>
                <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-slate-200">
                          <AvatarFallback className="bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.16))] text-sm font-semibold text-[#111827]">
                            {testimonial.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-[#111827]">{testimonial.name}</p>
                          <p className="text-sm text-slate-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]"
                        />
                      ))}
                    </div>
                    <p className="mt-5 text-sm leading-7 text-slate-600">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <GrowthFaqSection />
      <FinalCtaSection />

      <Footer />
    </div>
  );
};

export default Index;
