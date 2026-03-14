import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { services as fallbackServices, platforms as fallbackPlatforms } from "@/data/services";
import { ArrowRight, Clock3, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type CatalogPlatform = {
  id: string;
  name: string;
  slug: string;
};

type CatalogService = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  pricePerK: number;
  minOrder: number;
  maxOrder: number;
  deliverySpeed?: string | null;
  platform: { name: string; slug?: string };
};

const Services = () => {
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState("All");
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<CatalogService[]>(
    fallbackServices.map((service) => ({
      ...service,
      platform: { name: service.platform },
    }))
  );
  const [platforms, setPlatforms] = useState<string[]>(fallbackPlatforms);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [platformResponse, serviceResponse] = await Promise.all([
          apiRequest<{ data: CatalogPlatform[] }>("/platforms"),
          apiRequest<{ data: CatalogService[] }>("/services?limit=100"),
        ]);

        setPlatforms(["All", ...platformResponse.data.map((platform) => platform.name)]);
        setServices(serviceResponse.data);
      } catch (error) {
        toast({
          title: "Using saved catalog preview",
          description: getApiErrorMessage(error),
          variant: "destructive",
        });
      }
    };

    void loadCatalog();
  }, [toast]);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const platformName = service.platform?.name ?? "";
      const platformMatch = activePlatform === "All" || platformName === activePlatform;
      const searchMatch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase());
      return platformMatch && searchMatch;
    });
  }, [activePlatform, search, services]);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16 md:py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Service marketplace
              </Badge>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                Discover services built for a faster growth workflow
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Filter by platform, compare delivery speed, and move from discovery to checkout in a few clicks.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Premium catalog", value: `${services.length}+ services`, icon: Sparkles },
                { label: "Quick starts", value: "Orders begin fast", icon: TrendingUp },
                { label: "Protected checkout", value: "Wallet-first ordering", icon: ShieldCheck },
              ].map((item) => (
                <Card key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] shadow-none">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <item.icon className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-[#111827]">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.05)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const active = platform === activePlatform;
                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-[#111827] text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                          : "bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-[#111827]"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for followers, views, likes..."
                  className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC] pl-11 text-[#111827] placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-[#111827]">{filtered.length}</span> services
            </p>
            <p className="hidden text-sm text-slate-500 md:block">Minimal UI. Fast ordering. Real backend checkout.</p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.03 }}
              >
                <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <CardContent className="flex h-full flex-col p-7">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[#2563EB]">
                        {service.platform?.name}
                      </Badge>
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {service.deliverySpeed || "Fast delivery"}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <div className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Instant-ready</div>
                      <div className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">Trending</div>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{service.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{service.description}</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 rounded-[1.25rem] bg-[#F8FAFC] p-4 text-sm">
                      <div>
                        <p className="text-slate-400">Min</p>
                        <p className="mt-1 font-semibold text-[#111827]">{service.minOrder.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Max</p>
                        <p className="mt-1 font-semibold text-[#111827]">{service.maxOrder.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">${service.pricePerK}</p>
                        <p className="text-sm text-slate-500">per 1K</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/services/${service.id}`}>
                          <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                            Details
                          </Button>
                        </Link>
                        <Link to={`/services/${service.id}`}>
                          <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                            Order
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 py-20 text-center">
              <p className="text-lg font-medium text-[#111827]">No services match your current filters.</p>
              <p className="mt-2 text-slate-500">Try another platform or search term.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
