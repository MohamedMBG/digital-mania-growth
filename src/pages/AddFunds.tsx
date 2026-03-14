import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, LockKeyhole, Wallet } from "lucide-react";
import { apiRequestWithRefresh, getApiErrorMessage } from "@/lib/api";

type WalletResponse = {
  data: {
    balance: number;
    currency: string;
  };
};

type WalletTransaction = {
  id: string;
  amount: number;
  type: string;
  description?: string | null;
  createdAt: string;
};

const AddFunds = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("50");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState("USD");
  const [activity, setActivity] = useState<WalletTransaction[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const presets = ["25", "50", "100", "250"];

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const [walletResponse, txResponse] = await Promise.all([
          apiRequestWithRefresh<WalletResponse>("/wallet"),
          apiRequestWithRefresh<{ data: WalletTransaction[] }>("/wallet/transactions?limit=3"),
        ]);

        setWalletBalance(walletResponse.data.balance);
        setWalletCurrency(walletResponse.data.currency);
        setActivity(txResponse.data);
      } catch (error) {
        toast({
          title: "Wallet data failed to load",
          description: getApiErrorMessage(error),
          variant: "destructive",
        });
      }
    };

    void loadWallet();
  }, [toast]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await apiRequestWithRefresh<{
        data: { url: string; amount: number; currency: string };
      }>("/payments/checkout", {
        method: "POST",
        body: {
          amount: Number(amount),
          currency: "usd",
        },
      });

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
      setSubmitting(false);
    }
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
                Manage top-ups with a secure Stripe workflow
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Add funds, complete checkout with Stripe, and keep the wallet ready for instant future orders.
              </p>
            </div>

            <Card className="rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_28px_70px_rgba(79,70,229,0.24)]">
              <CardContent className="p-7 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Current balance</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{walletCurrency} {walletBalance.toFixed(2)}</p>
                <p className="mt-4 text-sm leading-6 text-white/80">
                  Wallet balance updates only after verified backend webhooks, not frontend redirects.
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
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Choose amount</h2>
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

                  <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <CreditCard className="h-5 w-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827]">Stripe checkout</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Card payments are processed securely through Stripe. Your wallet is credited only after the verified webhook succeeds.
                        </p>
                      </div>
                    </div>
                  </div>
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
                        Stripe secure
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Method</span>
                        <span className="font-medium text-[#111827]">Credit or debit card</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium text-[#111827]">${amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Available after top-up</span>
                        <span className="font-medium text-[#111827]">{walletCurrency} {(walletBalance + Number(amount || 0)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {[
                        "Stripe-hosted payment page",
                        "Webhook-verified wallet credit",
                        "Safe for repeat ordering workflows",
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
                          <p className="font-semibold text-[#111827]">Verified backend payments</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Redirect success alone does not credit the wallet. The backend waits for Stripe webhook confirmation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="mt-8 h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] hover:bg-[#1d4ed8]"
                      onClick={() => {
                        void handleSubmit();
                      }}
                      disabled={submitting}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {submitting ? "Redirecting..." : `Add $${amount || "0"} to Wallet`}
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
                      {activity.length === 0 && (
                        <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-500">
                          No wallet activity yet.
                        </div>
                      )}
                      {activity.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4">
                          <div>
                            <p className="font-medium text-[#111827]">{item.description || item.type}</p>
                            <p className="mt-1 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className={`font-semibold ${item.amount >= 0 ? "text-emerald-600" : "text-[#111827]"}`}>
                            ${Math.abs(item.amount).toFixed(2)}
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
