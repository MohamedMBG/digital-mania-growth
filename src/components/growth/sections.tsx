import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  examplePlans,
  growthApproachComponents,
  growthFaqs,
  growthPlatforms,
  howItWorksSteps,
  whyTrendkItems,
} from "@/data/growth";
import { fadeUp, hoverLift, revealViewport } from "@/lib/motion";
import { ArrowRight, Compass, Layers3, Route, Shield, Sparkles } from "lucide-react";

type SectionProps = {
  /** Where every CTA in the section should send the visitor. */
  builderHref?: string;
};

/**
 * Same-page anchors need a real <a> so the browser handles the scroll (the app
 * already sets `scroll-behavior: smooth`); route targets go through the router.
 */
export const CtaLink = ({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) =>
  to.includes("#") ? (
    <a href={to} className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );

const Eyebrow = ({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
}) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
    <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
    {children}
  </div>
);

export const HowItWorksSection = () => (
  <motion.section
    id="how-it-works"
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
        <Eyebrow icon={Route}>How it works</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
          Your Goal. Our Plan.
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Four steps from where your account is today to a strategy built around it.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 lg:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <motion.div key={step.num} variants={fadeUp} custom={index * 0.08}>
            <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)] card-hover">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#F8FAFC]">
                <step.icon className="h-6 w-6 text-[#2563EB]" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">
                {step.num}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#111827]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

export const WhyTrendkSection = () => (
  <motion.section
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div variants={fadeUp}>
          <Eyebrow icon={Shield}>Why TrendK</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
            Every account starts somewhere different
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            You don't pick services. You set a goal, and our team decides what the
            account actually needs to move toward it.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {whyTrendkItems.map((item, index) => (
            <motion.div key={item.title} variants={fadeUp} custom={index * 0.06}>
              <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-[0_16px_40px_rgba(15,23,42,0.04)] card-hover">
                <CardContent className="p-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <item.icon className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#111827]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
);

export const PersonalizedApproachSection = ({ builderHref = "#goal-builder" }: SectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="bg-white py-20"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow icon={Compass}>Personalized approach</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
            Your growth shouldn't come from a template
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Every account starts from a different position. Instead of making you
            choose from dozens of services, TrendK studies your account and combines
            the right growth methods around your objective.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} custom={0.08} className="mt-12">
          <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
            <CardContent className="p-8 md:p-10">
              <p className="text-sm leading-7 text-slate-600">
                Depending on your account, a TrendK plan may combine:
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {growthApproachComponents.map((item, index) => (
                  <motion.span
                    key={item.label}
                    variants={fadeUp}
                    custom={0.02 * index}
                    whileHover={shouldReduceMotion ? {} : { y: -3 }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition-all duration-300 ease-out"
                  >
                    <item.icon className="h-4 w-4 text-[#2563EB]" />
                    {item.label}
                  </motion.span>
                ))}
              </div>
              <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-500">
                Your TrendK plan can combine the right tools based on your account,
                market and growth goal. You never have to assemble them yourself.
              </p>
              <div className="mt-8">
                <CtaLink to={builderHref}>
                  <Button className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]">
                    Build My Growth Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CtaLink>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

export const SupportedPlatformsSection = ({ builderHref = "#goal-builder" }: SectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="platforms"
      className="bg-white py-20"
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div className="container">
        <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
          <Eyebrow icon={Layers3}>Supported platforms</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
            One goal, built for your platform
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {growthPlatforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              variants={fadeUp}
              custom={0.05 * index}
              whileHover={shouldReduceMotion ? {} : hoverLift}
              className="h-full"
            >
              <Card className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <CardContent className="flex h-full flex-col p-7">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner">
                    <platform.icon className={`h-7 w-7 ${platform.tint}`} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
                    {platform.headline}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                    {platform.description}
                  </p>
                  <CtaLink to={builderHref} className="mt-6 block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                    >
                      {platform.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CtaLink>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export const ExamplePlansSection = () => (
  <motion.section
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow icon={Sparkles}>Example growth plans</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
          See how personalization works
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Illustrative examples of how a plan takes shape. These are not customer
          results.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {examplePlans.map((example, index) => (
          <motion.div key={example.profile} variants={fadeUp} custom={0.08 * index}>
            <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] card-hover">
              <CardContent className="flex h-full flex-col p-7">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[#2563EB]"
                  >
                    {example.platform}
                  </Badge>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Example
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
                  {example.profile}
                </h3>

                <div className="mt-5 flex items-end gap-3 rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Current
                    </p>
                    <p className="mt-1 text-xl font-semibold text-[#111827]">
                      {example.current}
                    </p>
                  </div>
                  <ArrowRight className="mb-1 h-4 w-4 text-slate-300" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Goal
                    </p>
                    <p className="mt-1 bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-xl font-semibold text-transparent">
                      {example.goal}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Possible strategy
                </p>
                <ul className="mt-3 flex-1 space-y-2">
                  {example.strategy.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C3AED]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

export const PlansBuiltAroundGoalSection = ({ builderHref = "#goal-builder" }: SectionProps) => (
  <motion.section
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <motion.div variants={fadeUp}>
        <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-12">
            <div>
              <Eyebrow icon={Compass}>Plans</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
                Plans Built Around Your Goal
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                No two accounts start from the same place. Your strategy, timeline
                and pricing are built around your platform, current position and
                growth objective.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm leading-7 text-slate-600">
                Pricing is shared after we review your account, so the proposal
                reflects the work your goal actually requires.
              </p>
              <CtaLink to={builderHref}>
                <Button className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]">
                  Get My Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CtaLink>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </motion.section>
);

export const GrowthFaqSection = () => (
  <motion.section
    id="faq"
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
        <Eyebrow icon={Shield}>FAQ</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
          Straight answers
        </h2>
      </motion.div>

      <motion.div variants={fadeUp} custom={0.08} className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-4">
          {growthFaqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${index}`}
              className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-[#111827] hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </motion.section>
);

export const FinalCtaSection = ({ builderHref = "#goal-builder" }: SectionProps) => (
  <motion.section
    className="bg-white py-20"
    initial="hidden"
    whileInView="visible"
    viewport={revealViewport}
  >
    <div className="container">
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_30px_80px_rgba(79,70,229,0.28)]">
          <CardContent className="relative px-8 py-14 text-center md:px-14 md:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="relative">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Set your goal
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                Where Do You Want Your Account to Be Next?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
                Set your growth goal and let TrendK build a strategy around it.
              </p>
              <div className="mt-8">
                <CtaLink to={builderHref}>
                  <Button
                    size="lg"
                    className="h-12 rounded-xl bg-white px-7 text-[#111827] hover:bg-white"
                  >
                    Build My Growth Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CtaLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </motion.section>
);
