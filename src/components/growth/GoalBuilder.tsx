import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import GoalArc from "@/components/growth/GoalArc";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getGrowthPlatform,
  getTimeframeLabel,
  growthPlatforms,
  growthTimeframes,
  whatHappensNext,
  type GrowthPlatformId,
  type GrowthTimeframeId,
} from "@/data/growth";
import { getApiErrorMessage } from "@/lib/api";
import { submitGrowthRequest, type GrowthRequest } from "@/lib/growth-api";
import { stepTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type BuilderVariant = "standard" | "business" | "creator";

type GoalBuilderProps = {
  id?: string;
  variant?: BuilderVariant;
  defaultPlatform?: GrowthPlatformId;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  className?: string;
};

type StepId =
  | "platform"
  | "business"
  | "current"
  | "target"
  | "timeframe"
  | "profile"
  | "contact";

const parseAudience = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
};

const formatAudienceInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "").slice(0, 10);
  return digits ? Number.parseInt(digits, 10).toLocaleString() : "";
};

const GoalBuilder = ({
  id = "goal-builder",
  variant = "standard",
  defaultPlatform,
  eyebrow = "Goal builder",
  title = "Where do you want your account to go?",
  subtitle = "Six quick steps. No marketing jargon, no service menu.",
  submitLabel = "Create My Growth Request",
  className,
}: GoalBuilderProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { user, accessToken, isAuthenticated } = useAuth();

  const [platform, setPlatform] = useState<GrowthPlatformId | null>(
    defaultPlatform ?? null
  );
  const [currentAudience, setCurrentAudience] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [timeframe, setTimeframe] = useState<GrowthTimeframeId | null>(null);
  const [profile, setProfile] = useState("");
  const [niche, setNiche] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [contactName, setContactName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<GrowthRequest | null>(null);

  const steps: StepId[] = useMemo(() => {
    const base: StepId[] = [
      "platform",
      "current",
      "target",
      "timeframe",
      "profile",
      "contact",
    ];

    return variant === "business"
      ? (["platform", "business", ...base.slice(1)] as StepId[])
      : base;
  }, [variant]);

  const activeStep = steps[stepIndex];
  const selectedPlatform = platform ? getGrowthPlatform(platform) : undefined;
  const audienceLabel = selectedPlatform?.audienceLabel ?? "Audience";
  const currentValue = parseAudience(currentAudience);
  const targetValue = parseAudience(targetAudience);

  const isStepValid = useMemo(() => {
    switch (activeStep) {
      case "platform":
        return platform !== null;
      case "business":
        return companyName.trim().length > 1;
      case "current":
        return currentAudience.trim().length > 0;
      case "target":
        return targetValue > currentValue;
      case "timeframe":
        return timeframe !== null;
      case "profile":
        return profile.trim().length > 1;
      case "contact":
        return (
          contactName.trim().length > 1 && /^\S+@\S+\.\S+$/.test(email.trim())
        );
      default:
        return false;
    }
  }, [
    activeStep,
    companyName,
    contactName,
    currentAudience,
    currentValue,
    email,
    platform,
    profile,
    targetValue,
    timeframe,
  ]);

  const goTo = (nextIndex: number) => {
    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStepIndex(Math.min(Math.max(nextIndex, 0), steps.length - 1));
  };

  const handleSubmit = async () => {
    if (!platform || !isStepValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await submitGrowthRequest(
        {
          accountType: variant === "business" ? "business" : "creator",
          platform,
          profile: profile.trim(),
          currentAudience: currentValue,
          targetAudience: targetValue,
          timeframe: timeframe ?? "not_sure",
          ...(niche.trim() ? { niche: niche.trim() } : {}),
          ...(companyName.trim() ? { companyName: companyName.trim() } : {}),
          ...(website.trim() ? { website: website.trim() } : {}),
          ...(industry.trim() ? { industry: industry.trim() } : {}),
          ...(targetMarket.trim() ? { targetMarket: targetMarket.trim() } : {}),
          ...(country.trim() ? { country: country.trim() } : {}),
          contactName: contactName.trim(),
          email: email.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
        isAuthenticated ? accessToken : null
      );

      setSubmitted(response.data);
    } catch (error) {
      toast({
        title: "We could not send your goal",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = shouldReduceMotion ? undefined : stepTransition;

  if (submitted) {
    const submittedPlatform = getGrowthPlatform(submitted.platform);

    return (
      <Card
        id={id}
        className={cn(
          "overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]",
          className
        )}
      >
        <CardContent className="p-7 md:p-10">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Request received
            </div>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Your Goal Is In.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {isAuthenticated
                ? "A private thread is now open on this goal. Your growth assistant is already pricing it there — reply CONFIRM to start, ask it anything first, or ask for a human whenever you want one."
                : "Our team will review your account, your current position and your target. We'll contact you with a personalized growth plan, recommended timeline and proposal."}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  What you submitted
                </p>
                <dl className="mt-5 space-y-4 text-sm">
                  {[
                    { label: "Platform", value: submittedPlatform?.name ?? submitted.platform },
                    { label: "Account", value: submitted.profile },
                    {
                      label: "Current audience",
                      value: submitted.currentAudience.toLocaleString(),
                    },
                    {
                      label: "Growth goal",
                      value: submitted.targetAudience.toLocaleString(),
                    },
                    {
                      label: "Desired timeframe",
                      value: getTimeframeLabel(submitted.timeframe),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className="text-right font-semibold text-[#111827]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  What happens next?
                </p>
                <ol className="mt-5 space-y-4">
                  {whatHappensNext.map((item, index) => (
                    <motion.li
                      key={item}
                      className="flex items-start gap-3"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08, ease: "easeOut" }}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(124,58,237,0.14))] text-xs font-semibold text-[#2563EB]">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-6 text-slate-600">{item}</span>
                    </motion.li>
                  ))}
                </ol>

                <p className="mt-6 text-xs leading-6 text-slate-400">
                  Your target is the objective we plan toward. It is not a
                  guaranteed result.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to={`/goals/${submitted.id}`}>
                  <Button className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]">
                    Open My Private Thread
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]">
                    Create an Account to Open a Private Thread
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[#111827] hover:bg-slate-50"
                onClick={() => {
                  setSubmitted(null);
                  setStepIndex(0);
                  setDirection(-1);
                }}
              >
                Set Another Goal
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  return (
    <Card
      id={id}
      className={cn(
        "overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <CardContent className="p-6 md:p-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
              {eyebrow}
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
              {title}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-7 text-slate-600">
              {subtitle}
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit shrink-0 rounded-full border-slate-200 bg-white px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
          >
            Step {stepIndex + 1} of {steps.length}
          </Badge>
        </div>

        <Progress value={progressValue} className="mt-6 h-1.5 bg-[#F8FAFC]" />

        <div className="relative mt-7 min-h-[19rem]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeStep}
              custom={direction}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {activeStep === "platform" && (
                <div>
                  <p className="text-lg font-semibold text-[#111827]">
                    Where do you want to grow?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Pick the account you want TrendK to build a plan for.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {growthPlatforms.map((item, index) => {
                      const active = platform === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setPlatform(item.id);
                            goTo(stepIndex + 1);
                          }}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
                          whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
                          className={cn(
                            "flex flex-col items-center gap-3 rounded-[1.5rem] border p-5 text-center transition-all duration-300 ease-out",
                            active
                              ? "border-[#2563EB]/30 bg-[#2563EB]/5 shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                          aria-pressed={active}
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner">
                            <item.icon className={cn("h-6 w-6", item.tint)} />
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            {item.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeStep === "business" && (
                <div className="max-w-xl">
                  <p className="text-lg font-semibold text-[#111827]">
                    Tell us about your business
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    This helps us understand your market before we look at the account.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="gb-company">Company name</Label>
                      <Input
                        id="gb-company"
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        placeholder="TrendK Coffee Co."
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gb-website">Website (optional)</Label>
                      <Input
                        id="gb-website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        placeholder="yourbrand.com"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gb-industry">Industry (optional)</Label>
                      <Input
                        id="gb-industry"
                        value={industry}
                        onChange={(event) => setIndustry(event.target.value)}
                        placeholder="Hospitality"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeStep === "current" && (
                <div className="max-w-xl">
                  <p className="text-lg font-semibold text-[#111827]">
                    Where are you now?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Your current {audienceLabel.toLowerCase()} on{" "}
                    {selectedPlatform?.name ?? "this platform"}.
                  </p>
                  <div className="mt-6">
                    <Label htmlFor="gb-current">Current {audienceLabel.toLowerCase()}</Label>
                    <Input
                      id="gb-current"
                      inputMode="numeric"
                      autoComplete="off"
                      value={currentAudience}
                      onChange={(event) =>
                        setCurrentAudience(formatAudienceInput(event.target.value))
                      }
                      placeholder="2,450"
                      className="mt-2 h-14 rounded-xl border-slate-200 bg-white text-2xl font-semibold tracking-[-0.03em]"
                    />
                  </div>
                </div>
              )}

              {activeStep === "target" && (
                <div>
                  <p className="text-lg font-semibold text-[#111827]">
                    Where do you want to go?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Type the exact {audienceLabel.toLowerCase()} number you want
                    on your counter. That number is what your private thread with
                    the team is about.
                  </p>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <Label htmlFor="gb-target">Growth goal</Label>
                      <Input
                        id="gb-target"
                        inputMode="numeric"
                        autoComplete="off"
                        value={targetAudience}
                        onChange={(event) =>
                          setTargetAudience(formatAudienceInput(event.target.value))
                        }
                        placeholder="10,000"
                        className="mt-2 h-14 rounded-xl border-slate-200 bg-white text-2xl font-semibold tracking-[-0.03em]"
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[2, 3, 5, 10].map((factor) => (
                          <button
                            key={factor}
                            type="button"
                            onClick={() =>
                              setTargetAudience(
                                formatAudienceInput(
                                  String(Math.max(currentValue * factor, factor * 100))
                                )
                              )
                            }
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:text-[#111827]"
                          >
                            {factor}x
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-xs leading-6 text-slate-400">
                        This is your objective, not a guaranteed result. How we
                        work toward it, what it costs and how fast it moves are
                        agreed with you privately — never on a public price list.
                      </p>
                    </div>

                    <GoalArc
                      current={currentValue}
                      target={targetValue}
                      audienceLabel={audienceLabel}
                      platformName={selectedPlatform?.name}
                    />
                  </div>
                </div>
              )}

              {activeStep === "timeframe" && (
                <div>
                  <p className="text-lg font-semibold text-[#111827]">
                    When would you like to work toward this goal?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    This tells us your expectations. We'll recommend what is realistic.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {growthTimeframes.map((item, index) => {
                      const active = timeframe === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setTimeframe(item.id);
                            goTo(stepIndex + 1);
                          }}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
                          whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
                          className={cn(
                            "rounded-[1.5rem] border p-5 text-left transition-all duration-300 ease-out",
                            active
                              ? "border-[#2563EB]/30 bg-[#2563EB]/5 shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          )}
                          aria-pressed={active}
                        >
                          <p className="text-base font-semibold text-[#111827]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {item.hint}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeStep === "profile" && (
                <div className="max-w-xl">
                  <p className="text-lg font-semibold text-[#111827]">
                    Which account should we review?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Paste your profile URL or your @username.
                  </p>
                  <div className="mt-6 grid gap-4">
                    <div>
                      <Label htmlFor="gb-profile">
                        {selectedPlatform?.name ?? "Social"} profile
                      </Label>
                      <Input
                        id="gb-profile"
                        value={profile}
                        onChange={(event) => setProfile(event.target.value)}
                        placeholder={selectedPlatform?.handleHint ?? "@yourbrand"}
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    {variant !== "business" && (
                      <div>
                        <Label htmlFor="gb-niche">Niche (optional)</Label>
                        <Input
                          id="gb-niche"
                          value={niche}
                          onChange={(event) => setNiche(event.target.value)}
                          placeholder="Fitness, food, fashion, gaming…"
                          className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeStep === "contact" && (
                <div>
                  <p className="text-lg font-semibold text-[#111827]">
                    Where should we send your plan?
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    A real person from TrendK will get back to you.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="gb-name">Name</Label>
                      <Input
                        id="gb-name"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gb-email">Email</Label>
                      <Input
                        id="gb-email"
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gb-phone">Phone / WhatsApp (optional)</Label>
                      <Input
                        id="gb-phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+1 555 000 0000"
                        autoComplete="tel"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gb-country">Country (optional)</Label>
                      <Input
                        id="gb-country"
                        value={country}
                        onChange={(event) => setCountry(event.target.value)}
                        placeholder="Morocco"
                        autoComplete="country-name"
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    {variant === "business" && (
                      <div className="sm:col-span-2">
                        <Label htmlFor="gb-market">Target market (optional)</Label>
                        <Input
                          id="gb-market"
                          value={targetMarket}
                          onChange={(event) => setTargetMarket(event.target.value)}
                          placeholder="Casablanca, GCC, US East Coast…"
                          className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {(activeStep === "current" ||
          activeStep === "timeframe" ||
          activeStep === "profile" ||
          activeStep === "contact") &&
          targetValue > 0 && (
            <GoalArc
              compact
              current={currentValue}
              target={targetValue}
              audienceLabel={audienceLabel}
              platformName={selectedPlatform?.name}
              className="mt-2"
            />
          )}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            className="h-12 rounded-xl text-slate-500 hover:text-[#111827] sm:w-auto"
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {stepIndex === steps.length - 1 ? (
            <Button
              size="lg"
              className="h-12 w-full rounded-xl border-0 bg-[#2563EB] px-6 text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8] sm:w-auto"
              disabled={!isStepValid || isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending your goal
                </>
              ) : (
                <>
                  {submitLabel}
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-12 w-full rounded-xl border-0 bg-[#2563EB] px-6 text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8] sm:w-auto"
              disabled={!isStepValid}
              onClick={() => goTo(stepIndex + 1)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalBuilder;
