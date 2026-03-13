import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, testimonials } from "@/data/services";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Clock3,
  Facebook,
  HeadphonesIcon,
  Heart,
  Instagram,
  LockKeyhole,
  MessageCircle,
  Music,
  Package,
  Play,
  Send,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  Users,
  Youtube,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(end * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.35 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [duration, end]);

  return { count, ref };
};

const heroCards = [
  {
    title: "Instagram Followers",
    value: "+12,847",
    detail: "Live growth in the last 24 hours",
    icon: Instagram,
    color: "from-[#2563EB] via-[#7C3AED] to-[#A855F7]",
    position: "lg:ml-14",
    delay: 0.1,
  },
  {
    title: "TikTok Views",
    value: "+284K",
    detail: "Velocity optimized for fast campaigns",
    icon: Play,
    color: "from-slate-900 via-[#2563EB] to-[#7C3AED]",
    position: "lg:ml-40",
    delay: 0.25,
  },
  {
    title: "YouTube Likes",
    value: "+5,392",
    detail: "Premium delivery from active profiles",
    icon: Youtube,
    color: "from-[#7C3AED] via-[#2563EB] to-sky-400",
    position: "lg:ml-20",
    delay: 0.4,
  },
];

const heroDepthChips = [
  {
    title: "Likes",
    value: "24.8K",
    icon: Heart,
    className: "hero-chip-one",
    iconClassName: "text-rose-500",
  },
  {
    title: "Comments",
    value: "842",
    icon: MessageCircle,
    className: "hero-chip-two",
    iconClassName: "text-sky-500",
  },
  {
    title: "Saves",
    value: "1.9K",
    icon: Bookmark,
    className: "hero-chip-three",
    iconClassName: "text-violet-500",
  },
];

const trustBadges = [
  { icon: Users, label: "Trusted by 10,000+ creators" },
  { icon: Star, label: "4.9 average rating" },
  { icon: TrendingUp, label: "50,000+ orders delivered" },
];

const liveOrders = [
  "James from London just ordered Instagram Followers",
  "Emily from Toronto purchased TikTok Views",
  "Marcus from Sydney just bought YouTube Likes",
  "Sarah from Berlin placed an order for Spotify Plays",
];

const platformIcons = [
  { name: "Instagram", icon: Instagram, tint: "text-pink-500" },
  { name: "TikTok", icon: Play, tint: "text-slate-900" },
  { name: "YouTube", icon: Youtube, tint: "text-red-500" },
  { name: "Twitter", icon: Twitter, tint: "text-sky-500" },
  { name: "Spotify", icon: Music, tint: "text-emerald-500" },
  { name: "Facebook", icon: Facebook, tint: "text-blue-600" },
  { name: "Telegram", icon: Send, tint: "text-sky-400" },
];

const trustItems = [
  { icon: Shield, title: "Secure Payments", desc: "Encrypted checkout flows built for safe purchasing." },
  { icon: Zap, title: "Fast Delivery", desc: "Orders begin quickly so campaigns build momentum fast." },
  { icon: BadgeCheck, title: "Trusted Service", desc: "Reliable delivery with premium social proof quality." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Helpful responses whenever you need guidance." },
];

const steps = [
  { num: "01", title: "Choose a Service", desc: "Browse the services that match your growth goal.", icon: Package },
  { num: "02", title: "Paste Your Link", desc: "Drop in your profile, reel, post, or video URL.", icon: ArrowRight },
  { num: "03", title: "Checkout Securely", desc: "Complete your order in seconds with a protected checkout.", icon: LockKeyhole },
  { num: "04", title: "Receive Engagement", desc: "Watch your numbers grow and your profile look in demand.", icon: TrendingUp },
];

const whyItems = [
  { title: "High-quality engagement", desc: "Growth services designed to look clean, premium, and credible.", icon: Sparkles },
  { title: "Secure checkout", desc: "A frictionless purchase flow backed by safe payment handling.", icon: Shield },
  { title: "Fast order processing", desc: "Quick starts help new posts gain momentum while they are still fresh.", icon: Clock3 },
  { title: "Reliable delivery", desc: "Consistent fulfillment that helps creators and brands scale with confidence.", icon: CheckCircle2 },
];

const serviceBadges = ["Instant delivery", "Trending service"];

const Index = () => {
  const shouldReduceMotion = useReducedMotion();
  const orders = useCounter(50000);
  const customers = useCounter(10000);
  const rating = useCounter(49, 1500);
  const popularServices = services.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <motion.section
        className="relative overflow-hidden bg-white pb-10 pt-20 md:pb-14 md:pt-28"
        initial="hidden"
        animate="visible"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_70%)]" />
          <div className="absolute right-[-6%] top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="container relative">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div className="max-w-2xl" variants={fadeUp} custom={0}>
              <Badge
                variant="outline"
                className="mb-6 rounded-full border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
              >
                Premium growth platform
              </Badge>

              <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-[#111827] md:text-6xl xl:text-7xl">
                Turn Every Post Into a{" "}
                <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  Social Magnet
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                Digital Mania gives creators and brands a faster path to trust with premium social growth services, polished delivery, and a purchase flow designed for conversion.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/services">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[#111827] shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Explore Services
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {trustBadges.map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    variants={fadeUp}
                    custom={0.15 + index * 0.07}
                  >
                    <badge.icon className="h-4 w-4 text-[#2563EB]" />
                    {badge.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="hero-stage relative" variants={fadeUp} custom={0.15}>
              <div className="hero-depth-orb hero-depth-orb-left" />
              <div className="hero-depth-orb hero-depth-orb-right" />
              <div className="hero-depth-ring hero-depth-ring-one" />
              <div className="hero-depth-ring hero-depth-ring-two" />
              <div className="hero-depth-panel hero-depth-panel-back" />
              <div className="hero-depth-panel hero-depth-panel-mid" />
              <div className="pointer-events-none absolute inset-x-10 top-8 h-[28rem] rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.10),transparent_35%)]" />
              <div className="hero-depth-main relative rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
                <div className="absolute inset-x-20 top-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Campaign overview</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Growth in motion</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      Live preview
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {heroCards.map((card, index) => (
                      <motion.div
                        key={card.title}
                        className={`rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ${card.position}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.01 }}
                        style={{
                          animation: shouldReduceMotion ? "none" : `float-card 6s ease-in-out ${index * 0.5}s infinite`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                              <card.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">{card.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                            </div>
                          </div>
                          <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                            Live
                          </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">{card.value}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Last 24 hours</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Growing now
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {heroDepthChips.map((chip, index) => (
                <motion.div
                  key={chip.title}
                  className={`hero-depth-chip ${chip.className}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 16 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.45 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="hero-depth-chip-icon">
                      <chip.icon className={`h-4 w-4 ${chip.iconClassName}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{chip.title}</p>
                      <p className="text-sm font-semibold text-[#111827]">{chip.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                className="hero-social-pill hero-social-pill-top"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -12, y: 12 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                98% engagement spike
              </motion.div>

              <motion.div
                className="hero-social-pill hero-social-pill-bottom"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 12, y: -10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 }}
              >
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Delivering now
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="border-y border-slate-200/80 bg-white py-4">
        <div className="container overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live activity
            </div>
            <div className="relative flex-1 overflow-hidden">
              <motion.div
                className="flex min-w-max gap-4"
                animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
                transition={shouldReduceMotion ? {} : { duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...liveOrders, ...liveOrders].map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                  >
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        <div className="container">
          <motion.div className="mx-auto max-w-xl text-center" variants={fadeUp} custom={0}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Supported platforms</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Built for every major growth channel
            </h2>
          </motion.div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {platformIcons.map((platform, index) => (
              <motion.div
                key={platform.name}
                variants={fadeUp}
                custom={0.05 * index}
                whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.03 }}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-[0_15px_35px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.12)]">
                  <platform.icon className={`h-8 w-8 ${platform.tint}`} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">{platform.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-8 md:py-12" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-4">
            {trustItems.map((item, index) => (
              <motion.div key={item.title} variants={fadeUp} custom={0.05 * index}>
                <Card className="h-full rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-7">
                    <motion.div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(124,58,237,0.10))]"
                      animate={shouldReduceMotion ? {} : { y: [0, -4, 0] }}
                      transition={shouldReduceMotion ? {} : { duration: 3.2, repeat: Infinity, delay: index * 0.25 }}
                    >
                      <item.icon className="h-5 w-5 text-[#2563EB]" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-[#111827]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
        <div className="container">
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-8 md:grid-cols-3 md:p-12">
            {[
              { ref: orders.ref, value: `${orders.count.toLocaleString()}+`, label: "Orders Delivered" },
              { ref: customers.ref, value: `${customers.count.toLocaleString()}+`, label: "Happy Customers" },
              { ref: rating.ref, value: (rating.count / 10).toFixed(1), label: "Average Rating" },
            ].map((item, index) => (
              <motion.div key={item.label} ref={item.ref} variants={fadeUp} custom={0.05 * index} className="text-center">
                <p className="text-5xl font-semibold tracking-[-0.05em] text-[#111827]">{item.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container">
          <motion.div className="mx-auto max-w-xl text-center" variants={fadeUp} custom={0}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Order in minutes, scale with confidence
            </h2>
          </motion.div>

          <div className="relative mt-14 grid gap-6 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-[#2563EB]/20 via-[#7C3AED]/30 to-[#2563EB]/20 lg:block" />
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={0.05 * index}
                className="relative rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
              >
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#F8FAFC]"
                  animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
                  transition={shouldReduceMotion ? {} : { duration: 3, repeat: Infinity, delay: index * 0.2 }}
                >
                  <step.icon className="h-6 w-6 text-[#2563EB]" />
                </motion.div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">{step.num}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#111827]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div variants={fadeUp} custom={0}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Why Digital Mania</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
                Why Choose Digital Mania
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
                The platform is designed to feel fast, trustworthy, and premium from the first click to the final delivery.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2">
              {whyItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={0.08 + index * 0.05}
                  className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <item.icon className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#111827]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container">
          <motion.div className="mx-auto max-w-xl text-center" variants={fadeUp} custom={0}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Testimonials</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
              Trusted by creators who care about quality
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeUp} custom={0.05 * index}>
                <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)]">
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
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </div>
                    </div>

                    <div className="mt-6 flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                        <Star key={starIndex} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
        <div className="container">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <motion.div variants={fadeUp} custom={0}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Popular services</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">
                Services built for fast conversion
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.08}>
              <Link to="/services" className="hidden md:block">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {popularServices.map((service, index) => (
              <motion.div key={service.id} variants={fadeUp} custom={0.04 * index}>
                <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
                  <CardContent className="flex h-full flex-col p-7">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[#2563EB]">
                        {service.platform}
                      </Badge>
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {service.deliverySpeed}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {serviceBadges.map((label, badgeIndex) => (
                        <div
                          key={`${service.id}-${label}`}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            badgeIndex === 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {badgeIndex === 0 ? "⚡" : "🔥"} {label}
                        </div>
                      ))}
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{service.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{service.description}</p>

                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div>
                        <div className="inline-flex items-end gap-1">
                          <span className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">${service.pricePerK}</span>
                          <span className="pb-1 text-sm text-slate-500">/ 1K</span>
                        </div>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{service.guarantee}</p>
                      </div>
                      <Link to={`/services/${service.id}`}>
                        <Button className="rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_16px_35px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]">
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/services">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container">
          <motion.div variants={fadeUp} custom={0}>
            <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_30px_80px_rgba(79,70,229,0.28)]">
              <CardContent className="relative px-8 py-14 text-center md:px-14 md:py-16">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />
                <div className="relative">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                    Start Growing Your Audience Today
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/82">
                    Join thousands of creators using Digital Mania to build trust, look established, and scale faster.
                  </p>
                  <div className="mt-8">
                    <Link to="/services">
                      <Button
                        size="lg"
                        className="h-12 rounded-xl bg-white px-7 text-[#111827] shadow-[0_16px_40px_rgba(255,255,255,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(255,255,255,0.34)] hover:bg-white"
                      >
                        Start Growing Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Index;
