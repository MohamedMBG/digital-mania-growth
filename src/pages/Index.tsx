 import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, testimonials } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Facebook,
  Gem,
  Globe2,
  HeadphonesIcon,
  Instagram,
  Layers3,
  LockKeyhole,
  Music,
  Package,
  Play,
  Rocket,
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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
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
  { title: "High-quality engagement", desc: "Growth services designed to look clean and credible.", icon: Sparkles },
  { title: "Secure checkout", desc: "A frictionless purchase flow backed by safe payment handling.", icon: Shield },
  { title: "Fast order processing", desc: "Quick starts help new posts gain momentum while they are still fresh.", icon: Clock3 },
  { title: "Reliable delivery", desc: "Consistent fulfillment that helps creators and brands scale with confidence.", icon: CheckCircle2 },
];

const popularServices = services.slice(0, 6);

const Index = () => {
  const shouldReduceMotion = useReducedMotion();
  const orders = useCounter(50000);
  const customers = useCounter(10000);
  const rating = useCounter(49, 1500);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <motion.section className="relative overflow-hidden bg-white pb-12 pt-20 md:pt-28" initial="hidden" animate="visible">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_70%)]" />
          <div className="absolute right-[-6%] top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)]" />
        </div>

        <div className="container relative">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div variants={fadeUp} custom={0} className="max-w-2xl">
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Premium growth platform
              </Badge>
              <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-[#111827] md:text-6xl xl:text-7xl">
                Turn Every Post Into a{" "}
                <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                  Social Magnet
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                NEXORA helps creators and brands launch polished campaigns with fast social growth services, secure checkout, and a workflow that feels effortless.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <Gem className="h-4 w-4 text-[#2563EB]" />
                  Premium visual quality
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <Rocket className="h-4 w-4 text-[#7C3AED]" />
                  Quick launch workflow
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-sm text-slate-600">
                  <Globe2 className="h-4 w-4 text-sky-500" />
                  Global creator support
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/services">
                  <Button size="lg" className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[#111827] hover:bg-slate-50">
                    Explore Services
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { icon: Users, label: "Trusted by 10,000+ creators" },
                  { icon: Star, label: "4.9 average rating" },
                  { icon: TrendingUp, label: "50,000+ orders delivered" },
                ].map((item) => (
                  <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                    <item.icon className="h-4 w-4 text-[#2563EB]" />
                    {item.label}
                  </div>
                ))}
              </div>
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
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Campaign overview</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Growth in motion</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">Live preview</div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      { title: "Instagram Followers", value: "+12,847", icon: Instagram, color: "from-[#2563EB] via-[#7C3AED] to-[#A855F7]" },
                      { title: "TikTok Views", value: "+284K", icon: Play, color: "from-slate-900 via-[#2563EB] to-[#7C3AED]" },
                      { title: "YouTube Likes", value: "+5,392", icon: Youtube, color: "from-[#7C3AED] via-[#2563EB] to-sky-400" },
                    ].map((card, index) => (
                      <motion.div
                        key={card.title}
                        className="rounded-[1.5rem] border border-white bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.12 + index * 0.1 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                              <card.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">{card.title}</p>
                              <p className="mt-1 text-xs text-slate-500">Last 24 hours</p>
                            </div>
                          </div>
                          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
                            Growing
                          </div>
                        </div>
                        <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">{card.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hero-depth-chip hero-chip-one">
                <div className="flex items-center gap-3">
                  <div className="hero-depth-chip-icon">
                    <Star className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Rating</p>
                    <p className="text-sm font-semibold text-[#111827]">4.9 stars</p>
                  </div>
                </div>
              </div>
              <div className="hero-depth-chip hero-chip-two">
                <div className="flex items-center gap-3">
                  <div className="hero-depth-chip-icon">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Velocity</p>
                    <p className="text-sm font-semibold text-[#111827]">842 new comments</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="border-y border-slate-200/80 bg-white py-4">
        <div className="container">
          <div className="flex flex-wrap gap-4">
            {[
              "James from London just ordered Instagram Followers",
              "Emily from Toronto purchased TikTok Views",
              "Marcus from Sydney just bought YouTube Likes",
            ].map((item) => (
              <div key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <motion.section className="bg-white py-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Layers3 className="h-3.5 w-3.5 text-[#2563EB]" />
              Supported platforms
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">Built for every major growth channel</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {platformIcons.map((platform, index) => (
              <motion.div key={platform.name} variants={fadeUp} custom={0.04 * index} whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.03 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-[0_15px_35px_rgba(15,23,42,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner">
                  <platform.icon className={`h-8 w-8 ${platform.tint}`} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">{platform.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="bg-white py-8 md:py-12">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-4">
            {trustItems.map((item) => (
              <Card key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <CardContent className="p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(124,58,237,0.10))]">
                    <item.icon className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111827]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-[#F8FAFC] p-8 md:grid-cols-3 md:p-12">
            {[
              { ref: orders.ref, value: `${orders.count.toLocaleString()}+`, label: "Orders Delivered", icon: Package, tint: "text-[#2563EB]" },
              { ref: customers.ref, value: `${customers.count.toLocaleString()}+`, label: "Happy Customers", icon: Users, tint: "text-[#2563EB]" },
              { ref: rating.ref, value: (rating.count / 10).toFixed(1), label: "Average Rating", icon: Star, tint: "text-amber-500" },
            ].map((item) => (
              <div key={item.label} ref={item.ref} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <item.icon className={`h-6 w-6 ${item.tint}`} />
                </div>
                <p className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[#111827]">{item.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Rocket className="h-3.5 w-3.5 text-[#7C3AED]" />
              How it works
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">Order in minutes, scale with confidence</h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.num} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#F8FAFC]">
                  <step.icon className="h-6 w-6 text-[#2563EB]" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">{step.num}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#111827]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
                Why NEXORA
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">Why Choose NEXORA</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">The platform is designed to feel fast, trustworthy, and premium from the first click to the final delivery.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {whyItems.map((item) => (
                <Card key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-7 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <CardContent className="p-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <item.icon className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#111827]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">Trusted by creators who care about quality</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-slate-200">
                        <AvatarFallback className="bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.16))] text-sm font-semibold text-[#111827]">
                          {testimonial.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
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
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-600">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Popular services
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#111827] md:text-4xl">Services built for fast conversion</h2>
            </div>
            <Link to="/services" className="hidden md:block">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {popularServices.map((service) => (
              <Card key={service.id} className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <CardContent className="flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="rounded-full border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[#2563EB]">
                      {service.platform}
                    </Badge>
                    <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {service.deliverySpeed}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <div className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Instant delivery
                      </span>
                    </div>
                    <div className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending service
                      </span>
                    </div>
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
                      <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_30px_80px_rgba(79,70,229,0.28)]">
            <CardContent className="relative px-8 py-14 text-center md:px-14 md:py-16">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />
              <div className="relative">
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start your next campaign
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">Start Growing Your Audience Today</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/82">
                  Join thousands of creators using NEXORA to build trust, look established, and scale faster.
                </p>
                <div className="mt-8">
                  <Link to="/services">
                    <Button size="lg" className="h-12 rounded-xl bg-white px-7 text-[#111827] hover:bg-white">
                      Start Growing Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
