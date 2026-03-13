import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/services";
import { paymentMethods, savedCards } from "@/data/platform";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const workflowSteps = [
  "Pick a service",
  "Paste your link",
  "Choose payment",
  "Confirm instantly",
];

const Order = () => {
  const { toast } = useToast();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [method, setMethod] = useState("card");
  const [cardId, setCardId] = useState(savedCards[0]?.id ?? "");

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? services[0],
    [serviceId]
  );

  const clampedQuantity = useMemo(() => {
    if (!selectedService) return 0;
    return Math.min(Math.max(quantity, selectedService.minOrder), selectedService.maxOrder);
  }, [quantity, selectedService]);

  const totalPrice = selectedService
    ? ((clampedQuantity / 1000) * selectedService.pricePerK).toFixed(2)
    : "0.00";

  const handleSubmit = () => {
    if (!selectedService || !link.trim()) {
      toast({
        title: "Missing information",
        description: "Choose a service and add a valid social media link before confirming.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Checkout complete",
      description: `${clampedQuantity.toLocaleString()} ${selectedService.name} confirmed with ${paymentMethods.find((item) => item.id === method)?.name}.`,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Frontend checkout
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                Order in one clean, modern flow
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Configure the service, select a payment method, and complete your order with a streamlined frontend-only checkout experience.
              </p>
            </div>

            <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-none">
              <CardContent className="p-6">
                <div className="grid gap-3 md:grid-cols-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step} className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                      <p className="mt-2 text-sm font-semibold text-[#111827]">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="space-y-8 p-7 md:p-8">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 1</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Choose your service</h2>
                    <div className="mt-5 grid gap-3">
                      {services.slice(0, 6).map((service) => {
                        const active = service.id === serviceId;
                        return (
                          <button
                            key={service.id}
                            onClick={() => setServiceId(service.id)}
                            className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                              active
                                ? "border-[#2563EB] bg-[#2563EB]/5 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[#111827]">{service.name}</p>
                                <p className="mt-1 text-sm text-slate-500">{service.deliverySpeed} • {service.platform}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-[#111827]">${service.pricePerK}</p>
                                <p className="text-xs text-slate-400">per 1K</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
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
                        min={selectedService?.minOrder ?? 100}
                        max={selectedService?.maxOrder ?? 100000}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Min {selectedService?.minOrder.toLocaleString()} • Max {selectedService?.maxOrder.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block text-sm font-medium text-slate-600">Delivery</Label>
                      <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 text-sm text-slate-600">
                        <Clock3 className="mr-2 h-4 w-4 text-[#2563EB]" />
                        {selectedService?.deliverySpeed}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 2</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Select payment method</h2>
                    <div className="mt-5 grid gap-3">
                      {paymentMethods.map((paymentMethod) => {
                        const active = paymentMethod.id === method;
                        return (
                          <button
                            key={paymentMethod.id}
                            onClick={() => setMethod(paymentMethod.id)}
                            className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                              active
                                ? "border-[#2563EB] bg-[#2563EB]/5 shadow-sm"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                                  <paymentMethod.icon className="h-5 w-5 text-[#2563EB]" />
                                </div>
                                <div>
                                  <p className="font-semibold text-[#111827]">{paymentMethod.name}</p>
                                  <p className="text-sm text-slate-500">{paymentMethod.desc}</p>
                                </div>
                              </div>
                              <div className="text-right text-xs text-slate-500">
                                <p>{paymentMethod.fee}</p>
                                <p className="mt-1">{paymentMethod.eta}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {method === "card" && (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-[#2563EB]" />
                        <p className="text-sm font-semibold text-[#111827]">Saved cards</p>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {savedCards.map((card) => {
                          const active = card.id === cardId;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setCardId(card.id)}
                              className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                                active
                                  ? "border-[#111827] bg-white shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-[#111827]">{card.brand}</p>
                                <p className="text-xs text-slate-400">{card.expires}</p>
                              </div>
                              <p className="mt-6 text-lg font-semibold tracking-[0.18em] text-[#111827]">•••• {card.last4}</p>
                              <p className="mt-3 text-sm text-slate-500">{card.holder}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
              <Card className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Summary</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Ready to confirm</h3>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Secure
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Service</span>
                      <span className="font-medium text-[#111827]">{selectedService?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Quantity</span>
                      <span className="font-medium text-[#111827]">{clampedQuantity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Payment</span>
                      <span className="font-medium text-[#111827]">{paymentMethods.find((item) => item.id === method)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <span className="text-slate-500">Total</span>
                      <span className="text-3xl font-semibold tracking-[-0.04em] text-[#111827]">${totalPrice}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      "Protected payment interface",
                      "Immediate access in dashboard",
                      "Fast post-purchase workflow",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <LockKeyhole className="h-4 w-4 text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827]">Payments UI included</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          This is a frontend-only concept checkout designed to feel complete and production-ready.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-8 h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] hover:bg-[#1d4ed8]"
                    onClick={handleSubmit}
                  >
                    Confirm Order
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="mt-4 text-center text-xs text-slate-500">
                    Frontend-only checkout flow. No real payment is processed.
                  </p>
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

export default Order;
