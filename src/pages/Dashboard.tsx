import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, DollarSign, Plus, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { apiRequestWithRefresh, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type OrderItem = {
  id: string;
  targetUrl: string;
  quantity: number;
  chargeAmount: number;
  status: string;
  remains: number | null;
  createdAt: string;
  service?: { name: string; platform?: { name: string } };
};

type WalletResponse = {
  data: {
    balance: number;
    currency: string;
  };
};

type PaymentItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  description?: string | null;
};

const statusClasses: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  processing: "bg-blue-50 text-blue-600",
  queued: "bg-blue-50 text-blue-600",
  pending: "bg-amber-50 text-amber-700",
  partial: "bg-orange-50 text-orange-700",
  canceled: "bg-slate-100 text-slate-600",
  failed: "bg-rose-50 text-rose-600",
};

const Dashboard = () => {
  const { toast } = useToast();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState("USD");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [walletResponse, orderResponse, paymentResponse] = await Promise.all([
          apiRequestWithRefresh<WalletResponse>("/wallet"),
          apiRequestWithRefresh<{ data: OrderItem[] }>("/orders?limit=6"),
          apiRequestWithRefresh<{ data: PaymentItem[] }>("/payments/history?limit=4"),
        ]);

        setWalletBalance(walletResponse.data.balance);
        setWalletCurrency(walletResponse.data.currency);
        setOrders(orderResponse.data);
        setPayments(paymentResponse.data);
      } catch (error) {
        toast({
          title: "Dashboard data failed to load",
          description: getApiErrorMessage(error),
          variant: "destructive",
        });
      }
    };

    void loadDashboard();
  }, [toast]);

  const activeCampaigns = orders.filter((order) =>
    ["queued", "processing", "pending", "partial"].includes(order.status)
  ).length;
  const monthlySpend = orders.reduce((sum, order) => sum + order.chargeAmount, 0);
  const completedPayments = payments.filter((payment) => payment.status === "succeeded").length;

  const stats = [
    { label: "Available balance", value: `${walletCurrency} ${walletBalance.toFixed(2)}`, icon: Wallet },
    { label: "Tracked spend", value: `$${monthlySpend.toFixed(2)}`, icon: DollarSign },
    { label: "Active campaigns", value: `${activeCampaigns}`, icon: TrendingUp },
    { label: "Successful top-ups", value: `${completedPayments}`, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Workspace overview
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                Everything you need in one clean dashboard
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Track orders, manage wallet funds, and launch the next campaign without leaving your workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/order">
                <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </Link>
              <Link to="/add-funds">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                  <Wallet className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                  >
                    <Card className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                      <CardContent className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC]">
                          <stat.icon className="h-5 w-5 text-[#2563EB]" />
                        </div>
                        <p className="mt-5 text-sm text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Recent orders</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">Campaign performance</h2>
                    </div>
                    <Link to="/order">
                      <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827]">
                        Order Again
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-6 space-y-4">
                    {orders.length === 0 && (
                      <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-6 text-sm text-slate-500">
                        No orders yet. Create your first campaign to start tracking performance here.
                      </div>
                    )}

                    {orders.map((order) => {
                      const delivered = order.remains === null ? 0 : Math.max(order.quantity - order.remains, 0);
                      const progress = order.quantity > 0 ? Math.min(Math.round((delivered / order.quantity) * 100), 100) : 0;
                      const statusClass = statusClasses[order.status] ?? "bg-slate-100 text-slate-600";

                      return (
                        <div key={order.id} className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-[#111827]">{order.service?.name || "Service"}</p>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">{order.targetUrl}</p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-sm text-slate-500">{order.id}</p>
                              <p className="mt-1 font-semibold text-[#111827]">${order.chargeAmount.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                            <div>
                              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                                <span>Delivery progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2 bg-white" />
                            </div>
                            <div className="text-sm text-slate-500">
                              Qty {order.quantity.toLocaleString()} • {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_26px_70px_rgba(79,70,229,0.24)]">
                <CardContent className="p-7 text-white">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Wallet</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{walletCurrency} {walletBalance.toFixed(2)}</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                    Keep your balance ready for faster repeat orders and frictionless campaign launches.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link to="/add-funds">
                      <Button className="rounded-xl bg-white text-[#111827] hover:bg-white">
                        Top Up Wallet
                      </Button>
                    </Link>
                    <Link to="/order">
                      <Button variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15">
                        Create Order
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                <CardContent className="p-7">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                    <p className="font-semibold text-[#111827]">Recent top-ups</p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {payments.length === 0 && (
                      <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-500">
                        No payments recorded yet.
                      </div>
                    )}
                    {payments.map((payment) => (
                      <div key={payment.id} className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#111827]">{payment.description || "Wallet top-up"}</p>
                            <p className="mt-1 text-sm text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#111827]">+${payment.amount.toFixed(2)}</p>
                            <p className="mt-1 text-xs uppercase text-slate-400">{payment.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Link to="/add-funds" className="block">
                <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                  Manage Wallet and Payments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
