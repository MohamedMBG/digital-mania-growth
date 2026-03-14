import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { paymentMethods, savedCards, walletActivity } from "@/data/platform";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, LockKeyhole, Wallet } from "lucide-react";

const AddFunds = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState(paymentMethods[0].id);
  const [amount, setAmount] = useState("50");
  const [selectedCard, setSelectedCard] = useState(savedCards[0].id);

  const presets = ["25", "50", "100", "250"];

  const handleSubmit = () => {
    toast({
      title: "Wallet top-up prepared",
      description: `$${amount} is ready to be added using ${paymentMethods.find((item) => item.id === method)?.name}.`,
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Wallet & payments
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                Manage top-ups with a smoother payment workflow
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Add funds, pick a saved card, and keep the wallet ready for instant future orders.
              </p>
            </div>

            <Card className="rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_28px_70px_rgba(79,70,229,0.24)]">
              <CardContent className="p-7 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Current balance</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">$124.50</p>
                <p className="mt-4 text-sm leading-6 text-white/80">
                  Frontend wallet designed to support quick repeat purchases and lower checkout friction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="space-y-8 p-7 md:p-8">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 1</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Choose a payment method</h2>
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

                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 2</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Select amount</h2>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {presets.map((preset) => {
                        const active = amount === preset;
                        return (
                          <button
                            key={preset}
                            onClick={() => setAmount(preset)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                              active
                                ? "bg-[#111827] text-white"
                                : "bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-[#111827]"
                            }`}
                          >
                            ${preset}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4">
                      <Label className="mb-2 block text-sm font-medium text-slate-600">Custom amount</Label>
                      <Input
                        value={amount}
                        type="number"
                        min="10"
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      />
                    </div>
                  </div>

                  {method === "card" && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 3</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Saved cards</h2>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {savedCards.map((card) => {
                          const active = card.id === selectedCard;
                          return (
                            <button
                              key={card.id}
                              onClick={() => setSelectedCard(card.id)}
                              className={`rounded-[1.25rem] border p-5 text-left transition-all ${
                                active
                                  ? "border-[#111827] bg-[#F8FAFC] shadow-sm"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-[#111827]">{card.brand}</p>
                                <p className="text-xs text-slate-400">{card.expires}</p>
                              </div>
                              <p className="mt-7 text-lg font-semibold tracking-[0.2em] text-[#111827]">**** {card.last4}</p>
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
              <div className="space-y-6">
                <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Payment summary</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Top up wallet</h3>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Instant-ready
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Method</span>
                        <span className="font-medium text-[#111827]">{paymentMethods.find((item) => item.id === method)?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium text-[#111827]">${amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Available after top-up</span>
                        <span className="font-medium text-[#111827]">${(124.5 + Number(amount || 0)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {[
                        "Wallet balance updates instantly in UI",
                        "Saved payment methods look production-ready",
                        "Optimized for repeat ordering workflows",
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
                          <p className="font-semibold text-[#111827]">Frontend payments concept</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            This screen is UI-only and designed to simulate a complete wallet and payment experience.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="mt-8 h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] hover:bg-[#1d4ed8]"
                      onClick={handleSubmit}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Add ${amount || "0"} to Wallet
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                  <CardContent className="p-7">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#2563EB]" />
                      <p className="font-semibold text-[#111827]">Recent wallet activity</p>
                    </div>
                    <div className="mt-5 space-y-4">
                      {walletActivity.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4">
                          <div>
                            <p className="font-medium text-[#111827]">{item.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                          </div>
                          <p className={`font-semibold ${item.amount.startsWith("+") ? "text-emerald-600" : "text-[#111827]"}`}>
                            {item.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AddFunds;
