import {
  Activity,
  BarChart3,
  Compass,
  Facebook,
  Gauge,
  Handshake,
  Instagram,
  Layers3,
  LineChart,
  Linkedin,
  Megaphone,
  Play,
  Radar,
  Route,
  Search,
  Sparkles,
  Target,
  Twitter,
  UserRoundCheck,
  Users,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type GrowthPlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "x"
  | "linkedin";

export type GrowthTimeframeId =
  | "one_month"
  | "three_months"
  | "six_months"
  | "twelve_months"
  | "not_sure";

export type GrowthRequestStatus =
  | "submitted"
  | "under_review"
  | "plan_ready"
  | "active"
  | "paused"
  | "completed";

export type GrowthPlanStatus =
  | "draft"
  | "shared"
  | "accepted"
  | "changes_requested";

export type GrowthPlatform = {
  id: GrowthPlatformId;
  name: string;
  icon: LucideIcon;
  tint: string;
  /** What the audience number is called on this platform. */
  audienceLabel: string;
  handleHint: string;
  headline: string;
  description: string;
  cta: string;
};

export const growthPlatforms: GrowthPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    tint: "text-pink-500",
    audienceLabel: "Followers",
    handleHint: "@yourbrand",
    headline: "Instagram Growth",
    description:
      "Tell us where your Instagram account is today and where you want it to go. TrendK reviews your profile and creates a personalized strategy around your audience, positioning and objective.",
    cta: "Set My Instagram Goal",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Play,
    tint: "text-slate-900",
    audienceLabel: "Followers",
    handleHint: "@yourbrand",
    headline: "TikTok Growth",
    description:
      "Set your TikTok growth objective and let TrendK build a plan around your content, audience and account.",
    cta: "Set My TikTok Goal",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    tint: "text-red-500",
    audienceLabel: "Subscribers",
    handleHint: "@yourchannel",
    headline: "YouTube Growth",
    description:
      "Tell us your channel goal and we'll build a personalized strategy around your channel, audience and content.",
    cta: "Set My YouTube Goal",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    tint: "text-blue-600",
    audienceLabel: "Audience",
    handleHint: "facebook.com/yourpage",
    headline: "Facebook Growth",
    description:
      "Share your page and your audience goal. TrendK builds a strategy around your community, market and objective.",
    cta: "Set My Facebook Goal",
  },
  {
    id: "x",
    name: "X",
    icon: Twitter,
    tint: "text-sky-500",
    audienceLabel: "Followers",
    handleHint: "@yourhandle",
    headline: "X Growth",
    description:
      "Tell us where your X account stands today and where you want it to go. We'll shape a plan around your voice and audience.",
    cta: "Set My X Goal",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    tint: "text-blue-700",
    audienceLabel: "Audience",
    handleHint: "linkedin.com/in/you",
    headline: "LinkedIn Growth",
    description:
      "Set your professional audience goal and TrendK builds a plan around your positioning, industry and market.",
    cta: "Set My LinkedIn Goal",
  },
];

export const getGrowthPlatform = (id: GrowthPlatformId | string) =>
  growthPlatforms.find((platform) => platform.id === id);

export const growthTimeframes: { id: GrowthTimeframeId; label: string; hint: string }[] = [
  { id: "one_month", label: "1 month", hint: "Short sprint" },
  { id: "three_months", label: "3 months", hint: "Most common" },
  { id: "six_months", label: "6 months", hint: "Steady build" },
  { id: "twelve_months", label: "12 months", hint: "Long horizon" },
  { id: "not_sure", label: "Not sure", hint: "We'll advise" },
];

export const getTimeframeLabel = (id: GrowthTimeframeId | string) =>
  growthTimeframes.find((timeframe) => timeframe.id === id)?.label ?? "Not sure";

export const howItWorksSteps = [
  {
    num: "01",
    title: "Set Your Goal",
    desc: "Tell us where your account is today and where you want it to go.",
    icon: Target,
  },
  {
    num: "02",
    title: "We Analyze Your Account",
    desc: "We review your profile, positioning, audience and growth opportunities.",
    icon: Search,
  },
  {
    num: "03",
    title: "We Build Your Strategy",
    desc: "TrendK creates a personalized plan based on your platform, account, objective and timeframe.",
    icon: Route,
  },
  {
    num: "04",
    title: "We Grow Together",
    desc: "Once the plan is approved, our team handles the execution and tracks progress with you.",
    icon: Handshake,
  },
];

export const whyTrendkItems = [
  {
    title: "Built around your account",
    desc: "We start from your profile and your objective, not from a fixed package.",
    icon: Compass,
  },
  {
    title: "One conversation, not a checkout",
    desc: "You set a goal. Our team returns with the strategy, timeline and proposal.",
    icon: Handshake,
  },
  {
    title: "Clear about what growth is",
    desc: "Your number is a target we plan toward, never a promise we sell you.",
    icon: UserRoundCheck,
  },
  {
    title: "Managed end to end",
    desc: "Once a plan is approved, TrendK handles execution and reports on progress.",
    icon: Gauge,
  },
];

/**
 * Possible components of a custom plan — deliberately not priced or sold
 * individually. The team decides which apply after reviewing the account.
 */
export const growthApproachComponents = [
  { label: "Account optimization", icon: Sparkles },
  { label: "Profile positioning", icon: Compass },
  { label: "Audience growth campaigns", icon: Users },
  { label: "Social promotion", icon: Megaphone },
  { label: "Content strategy", icon: Layers3 },
  { label: "Distribution strategy", icon: Radar },
  { label: "Engagement strategy", icon: Activity },
  { label: "Account management", icon: UserRoundCheck },
  { label: "Performance analysis", icon: BarChart3 },
  { label: "Growth monitoring", icon: LineChart },
  { label: "Paid promotion where appropriate", icon: Target },
  { label: "Creator or business visibility campaigns", icon: Megaphone },
];

/** Illustrative only — not customer results. */
export const examplePlans = [
  {
    profile: "Local Restaurant",
    platform: "Instagram",
    current: "1.8K",
    goal: "10K",
    strategy: [
      "Profile optimization",
      "Local visibility",
      "Content positioning",
      "Audience growth campaigns",
      "Performance monitoring",
    ],
  },
  {
    profile: "Creator",
    platform: "TikTok",
    current: "12K",
    goal: "50K",
    strategy: [
      "Content positioning",
      "Distribution strategy",
      "Audience growth",
      "Performance optimization",
    ],
  },
  {
    profile: "E-commerce Brand",
    platform: "Instagram",
    current: "7K",
    goal: "25K",
    strategy: [
      "Audience expansion",
      "Product-focused content direction",
      "Promotional campaigns",
      "Growth monitoring",
    ],
  },
];

export const businessGoals = [
  "Build a stronger local audience",
  "Increase brand visibility",
  "Grow a product-focused community",
  "Expand into another market",
  "Strengthen social credibility",
  "Build a larger social audience",
];

export const growthFaqs = [
  {
    q: "What is TrendK?",
    a: "TrendK is a personalized social media growth service for creators and businesses. You tell us your current position and your growth goal, and our team builds a strategy around your account.",
  },
  {
    q: "How does it work?",
    a: "Choose your platform, tell us where your account is today and the audience number you want to reach. That opens a private thread on your goal, and our team replies there with a personalized plan, a timeline and a price.",
  },
  {
    q: "Is there a price list or a checkout?",
    a: "No. Nothing is sold from a public catalogue. Every engagement is quoted in your private thread after we look at the account and the number you want to reach.",
  },
  {
    q: "Who replies in my thread?",
    a: "Your growth assistant. It reads your goal, prices it, answers questions and starts the work the moment payment clears. Ask for a human at any point and someone from the TrendK team takes over the thread.",
  },
  {
    q: "How do I pay?",
    a: "From your wallet. Reply CONFIRM in the thread and the assistant charges your balance and starts immediately; if the balance is short it tells you the exact amount to add, then starts on its own once the top-up lands.",
  },
  {
    q: "Do you guarantee my target?",
    a: "No. The number you enter is your growth objective. Social media performance depends on many factors, so TrendK evaluates your account and recommends a realistic strategy and timeline.",
  },
  {
    q: "Can TrendK manage everything for me?",
    a: "Yes. Depending on your account and growth plan, TrendK can handle different parts of the strategy and execution for you.",
  },
  {
    q: "Which platforms are supported?",
    a: "Instagram, TikTok, YouTube, Facebook, X and LinkedIn.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on your platform, current position, target, timeframe and the strategy required. After reviewing your request, TrendK will provide a personalized proposal.",
  },
  {
    q: "Can businesses use TrendK?",
    a: "Yes. TrendK creates custom social growth plans for businesses, creators and brands.",
  },
];

export const growthStatusMeta: Record<
  GrowthRequestStatus,
  { label: string; className: string; description: string }
> = {
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-600",
    description: "We have your goal and it is queued for review.",
  },
  under_review: {
    label: "Under Review",
    className: "bg-amber-50 text-amber-700",
    description: "Our team is reviewing your account and growth opportunities.",
  },
  plan_ready: {
    label: "Plan Ready",
    className: "bg-violet-50 text-violet-600",
    description: "Your personalized plan is ready to review.",
  },
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-600",
    description: "Your plan is approved and the team is executing it.",
  },
  paused: {
    label: "Paused",
    className: "bg-slate-100 text-slate-600",
    description: "Work on this goal is paused.",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600",
    description: "This growth plan has run its course.",
  },
};

export const growthPlanStatusMeta: Record<
  GrowthPlanStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  shared: { label: "Awaiting your response", className: "bg-violet-50 text-violet-600" },
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-600" },
  changes_requested: {
    label: "Changes requested",
    className: "bg-amber-50 text-amber-700",
  },
};

export const whatHappensNext = [
  "A private thread opens on your goal",
  "Your assistant prices the gap to your target number",
  "You reply CONFIRM and pay from your wallet",
  "Delivery starts automatically and progress is posted in the thread",
];
