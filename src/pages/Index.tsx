import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, testimonials } from "@/data/services";
import {
  Instagram, Youtube, Music, Twitter, Facebook, Send,
  Shield, Zap, Star, HeadphonesIcon, Users, Package,
  ArrowRight, Check, Clock, TrendingUp, Heart
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Animated counter hook
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = 0;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
};

const Index = () => {
  const orders = useCounter(50000);
  const customers = useCounter(10000);
  const rating = useCounter(49, 1500);

  const platformIcons = [
    { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { name: "TikTok", icon: Music, color: "text-foreground" },
    { name: "YouTube", icon: Youtube, color: "text-red-500" },
    { name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { name: "Spotify", icon: Music, color: "text-green-500" },
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "Telegram", icon: Send, color: "text-sky-400" },
  ];

  const trustItems = [
    { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
    { icon: Zap, title: "Fast Delivery", desc: "Orders start in minutes" },
    { icon: Star, title: "Trusted Service", desc: "4.9★ average rating" },
    { icon: HeadphonesIcon, title: "24/7 Support", desc: "Always here to help" },
  ];

  const steps = [
    { num: "01", title: "Choose a Service", desc: "Browse our marketplace and select the service you need", icon: Package },
    { num: "02", title: "Paste Your Link", desc: "Enter your social media profile or post URL", icon: ArrowRight },
    { num: "03", title: "Checkout Securely", desc: "Pay with your preferred method — fast and safe", icon: Shield },
    { num: "04", title: "Receive Engagement", desc: "Watch your numbers grow within minutes", icon: TrendingUp },
  ];

  const popularServices = services.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl animate-fade-in-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Trusted by 10,000+ customers</span>
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
                Grow Your Social Presence{" "}
                <span className="gradient-text">With Confidence</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
                Digital Mania delivers fast, secure, and reliable social media growth services trusted by creators and businesses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/services">
                  <Button size="lg" className="gradient-primary border-0 px-8 text-primary-foreground hover:opacity-90 transition-opacity">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="px-8">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating cards */}
            <div className="relative hidden lg:block">
              <div className="relative h-[420px]">
                {[
                  { name: "Instagram Followers", count: "+12,847", color: "from-pink-500 to-purple-500", delay: "0s", top: "0", left: "10%" },
                  { name: "TikTok Views", count: "+284K", color: "from-foreground to-foreground/80", delay: "1s", top: "120px", left: "45%" },
                  { name: "YouTube Likes", count: "+5,392", color: "from-red-500 to-red-600", delay: "2s", top: "260px", left: "15%" },
                ].map((card) => (
                  <Card
                    key={card.name}
                    className="absolute w-64 border-0 bg-background shadow-xl animate-float"
                    style={{ top: card.top, left: card.left, animationDelay: card.delay }}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                        <Heart className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{card.name}</p>
                        <p className="text-xl font-bold text-foreground">{card.count}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-t border-border py-16">
        <div className="container">
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Supported Platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {platformIcons.map((p) => (
              <div key={p.name} className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                <p.icon className={`h-8 w-8 ${p.color} opacity-60 transition-opacity group-hover:opacity-100`} />
                <span className="text-xs font-medium text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + Metrics */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <Card key={item.title} className="card-hover border-0 bg-card shadow-sm">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-12 md:gap-20">
            <div ref={orders.ref} className="text-center">
              <p className="text-4xl font-extrabold text-foreground md:text-5xl">
                {orders.count.toLocaleString()}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Orders Delivered</p>
            </div>
            <div ref={customers.ref} className="text-center">
              <p className="text-4xl font-extrabold text-foreground md:text-5xl">
                {customers.count.toLocaleString()}+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div ref={rating.ref} className="text-center">
              <p className="text-4xl font-extrabold text-foreground md:text-5xl">
                {(rating.count / 10).toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Get started in under 20 seconds. It's that simple.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="group relative text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-sm transition-shadow group-hover:shadow-md">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">{step.num}</span>
                <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Loved by <span className="gradient-text">Creators</span>
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              See what our customers have to say about Digital Mania.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <Card key={i} className="card-hover border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="mb-14 flex items-end justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Popular <span className="gradient-text">Services</span>
              </h2>
              <p className="text-muted-foreground">Our most ordered services this month</p>
            </div>
            <Link to="/services" className="hidden md:block">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices.map((s) => (
              <Card key={s.id} className="card-hover border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {s.platform}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {s.deliverySpeed}
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{s.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">${s.pricePerK}</span>
                      <span className="text-sm text-muted-foreground"> / 1K</span>
                    </div>
                    <Link to={`/services/${s.id}`}>
                      <Button size="sm" className="gradient-primary border-0 text-primary-foreground hover:opacity-90">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/services">
              <Button variant="outline">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Card className="gradient-primary border-0 shadow-2xl">
            <CardContent className="flex flex-col items-center p-12 text-center md:p-16">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Grow Your Audience?
              </h2>
              <p className="mb-8 max-w-md text-primary-foreground/80">
                Join 10,000+ creators and businesses who trust Digital Mania for their social media growth.
              </p>
              <Link to="/services">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8">
                  Start Growing Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
