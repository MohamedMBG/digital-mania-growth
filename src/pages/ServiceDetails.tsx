import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services as fallbackServices } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RefreshCcw, Shield, Sparkles } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/api";

type ServiceDetailsData = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  pricePerK: number;
  minOrder: number;
  maxOrder: number;
  deliverySpeed?: string | null;
  guarantee?: string | null;
  refillPolicy?: string | null;
  platform: { name: string; slug?: string };
};

const DRAFT_KEY = "nexora-order-draft";

const ServiceDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState<ServiceDetailsData | null>(() => {
    const fallback = fallbackServices.find((item) => item.id === id);
    if (!fallback) return null;

    return {
      ...fallback,
      platform: { name: fallback.platform },
    };
  });
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);

  useEffect(() => {
    const loadService = async () => {
      try {
        const response = await apiRequest<{ data: ServiceDetailsData }>(`/services/${id}`);
        setService(response.data);
      } catch (error) {
        if (!service) {
          toast({
            title: "Service unavailable",
            description: getApiErrorMessage(error),
            variant: "destructive",
          });
        }
      }
    };

    if (id) {
      void loadService();
    }
  }, [id, service, toast]);

  const clampedQuantity = useMemo(() => {
    if (!service) return 0;
    return Math.min(Math.max(quantity, service.minOrder), service.maxOrder);
  }, [quantity, service]);

  if (!service) {
    return (
      <div className="min-h-screen bg-white text-[#111827]">
        <Header />
        <section className="py-24">
          <div className="container text-center">
            <p className="text-2xl font-semibold">Service not found</p>
            <p className="mt-3 text-slate-500">The service you were trying to access no longer exists.</p>
            <Link to="/services">
              <Button className="mt-6 rounded-xl bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                Back to Services
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const totalPrice = ((clampedQuantity / 1000) * service.pricePerK).toFixed(2);
  const relatedServices = fallbackServices
    .filter((item) => item.platform === service.platform.name && item.id !== service.id)
    .slice(0, 3);

  const handleOrder = () => {
    if (!link.trim()) {
      toast({
        title: "Link required",
        description: "Add the destination URL before continuing to checkout.",
        variant: "destructive",
      });
      return;
    }

    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        serviceId: service.id,
        quantity: clampedQuantity,
        targetUrl: link.trim(),
      })
    );

    if (!isAuthenticated) {
      toast({
        title: "Create an account first",
        description: "Open your account before placing an order.",
      });
      navigate(`/register?redirect=${encodeURIComponent("/order")}`);
      return;
    }

    navigate("/order");
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="py-14 md:py-16">
        <div className="container">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#111827]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="outline" className="rounded-full border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-1 text-[#2563EB]">
                {service.platform.name}
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{service.description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Clock3, label: "Delivery speed", value: service.deliverySpeed || "Fast delivery" },
                  { icon: Shield, label: "Guarantee", value: service.guarantee || "Protected order flow" },
                  { icon: RefreshCcw, label: "Refill policy", value: service.refillPolicy || "No refill needed" },
                  { icon: Sparkles, label: "Quality", value: "Premium engagement flow" },
                ].map((item) => (
                  <Card key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] shadow-none">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <item.icon className="h-5 w-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">{item.label}</p>
                        <p className="mt-1 font-semibold text-[#111827]">{item.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Why this converts</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                      Social proof that looks polished from the start
                    </h2>
                  </div>
                  <div className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 md:inline-flex">
                    Active demand
                  </div>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    "Fast ordering workflow",
                    "Wallet-backed checkout",
                    "Dashboard tracking after purchase",
                  ].map((item) => (
                    <div key={item} className="rounded-[1.25rem] bg-[#F8FAFC] px-4 py-4 text-sm font-medium text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {relatedServices.length > 0 && (
                <div className="mt-10">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Related services</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {relatedServices.map((item) => (
                      <Card key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
                        <CardContent className="p-5">
                          <p className="text-sm font-semibold text-[#111827]">{item.name}</p>
                          <p className="mt-2 text-sm text-slate-500">${item.pricePerK} per 1K</p>
                          <Link to={`/services/${item.id}`}>
                            <Button variant="outline" className="mt-4 w-full rounded-xl border-slate-200 bg-white text-[#111827]">
                              View
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <Card className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Quick checkout</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                        Configure your order
                      </h3>
                    </div>
                    <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                      Step 1 of 2
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div>
                      <Label className="mb-2 block text-sm font-medium text-slate-600">Destination link</Label>
                      <Input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://instagram.com/yourprofile"
                        className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-medium text-slate-600">Quantity</Label>
                      <Input
                        type="number"
                        value={quantity}
                        min={service.minOrder}
                        max={service.maxOrder}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Min {service.minOrder.toLocaleString()} • Max {service.maxOrder.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Order total</span>
                        <span className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">${totalPrice}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>{clampedQuantity.toLocaleString()} units</span>
                        <span>${service.pricePerK} / 1K</span>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4">
                      {[
                        "Secure account-gated checkout",
                        "Fast fulfillment workflow",
                        "Live dashboard tracking after purchase",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <Button
                      className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_18px_45px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]"
                      onClick={handleOrder}
                    >
                      {isAuthenticated ? "Continue to Order" : "Create Account to Order"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetails;
