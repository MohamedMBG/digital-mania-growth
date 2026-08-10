import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardNav from "@/components/dashboard/DashboardNav";
import GoalCard from "@/components/growth/GoalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Clock3,
  MessageSquare,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { apiRequestWithRefresh, getApiErrorMessage } from "@/lib/api";
import {
  getGoalProgress,
  listMyGrowthRequests,
  type GrowthRequest,
} from "@/lib/growth-api";
import { fadeUp } from "@/lib/motion";
import { getGrowthPlatform, growthStatusMeta } from "@/data/growth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const orderStatusClasses: Record<string, string> = {
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
  const [goals, setGoals] = useState<GrowthRequest[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [walletResponse, orderResponse, paymentResponse, goalResponse] =
          await Promise.all([
            apiRequestWithRefresh<WalletResponse>("/wallet"),
            apiRequestWithRefresh<{ data: OrderItem[] }>("/orders?limit=6"),
            apiRequestWithRefresh<{ data: PaymentItem[] }>("/payments/history?limit=4"),
            listMyGrowthRequests(),
          ]);

        setWalletBalance(walletResponse.data.balance);
        setWalletCurrency(walletResponse.data.currency);
        setOrders(orderResponse.data);
        setPayments(paymentResponse.data);
        setGoals(goalResponse.data);
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

  const primaryGoal = goals[0] ?? null;
  const primaryPlatform = primaryGoal
    ? getGrowthPlatform(primaryGoal.platform)
    : undefined;
  const primaryProgress = primaryGoal ? getGoalProgress(primaryGoal) : null;
  const activeGoals = goals.filter((goal) =>
    ["submitted", "under_review", "plan_ready", "active"].includes(goal.status)
  ).length;
  const plansReady = goals.filter((goal) => goal.plan !== null).length;

  const stats = [
    { label: "Goals in progress", value: `${activeGoals}`, icon: Target },
    { label: "Plans shared with you", value: `${plansReady}`, icon: TrendingUp },
    {
      label: "Available balance",
      value: `${walletCurrency} ${walletBalance.toFixed(2)}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-14">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
              >
                Workspace overview
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                Your goals, your plans, one workspace
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Follow every growth goal from submission to an active plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/#goal-builder">
                <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                  <Target className="mr-2 h-4 w-4" />
                  New Growth Goal
                </Button>
              </a>
              <Link to="/goals">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                >
                  My Goals
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-8">
            <DashboardNav />
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
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
                        <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#111827]">
                          {stat.value}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <CardContent className="p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        Primary goal
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                        {primaryGoal
                          ? `${primaryPlatform?.name} — ${primaryGoal.profile}`
                          : "No goal set yet"}
                      </h2>
                    </div>
                    {primaryGoal && (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          growthStatusMeta[primaryGoal.status].className
                        )}
                      >
                        {growthStatusMeta[primaryGoal.status].label}
                      </span>
                    )}
                  </div>

                  {primaryGoal ? (
                    <>
                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            label: "Starting",
                            value: primaryGoal.currentAudience.toLocaleString(),
                          },
                          {
                            label: "Current",
                            value:
                              primaryGoal.latestAudience === null
                                ? "Not recorded yet"
                                : primaryGoal.latestAudience.toLocaleString(),
                          },
                          {
                            label: "Goal",
                            value: primaryGoal.targetAudience.toLocaleString(),
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-5"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {primaryProgress === null ? (
                        <p className="mt-5 text-xs leading-6 text-slate-400">
                          Progress appears once our team records an audience reading
                          for this account.
                        </p>
                      ) : (
                        <div className="mt-6">
                          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                            <span>Toward your goal</span>
                            <span>{primaryProgress}%</span>
                          </div>
                          <Progress value={primaryProgress} className="h-2 bg-[#F8FAFC]" />
                        </div>
                      )}

                      <div className="mt-7 flex flex-wrap gap-3">
                        <Link to={`/goals/${primaryGoal.id}`}>
                          <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                            {primaryGoal.plan ? "View Plan" : "View Goal"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to="/tickets">
                          <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact TrendK
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
                        Tell us where your account is today and where you want it to
                        go. Our team reviews it and comes back with a personalized
                        plan.
                      </p>
                      <a href="/#goal-builder" className="mt-6 inline-block">
                        <Button className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]">
                          Build My Growth Plan
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    </>
                  )}
                </CardContent>
              </Card>

              {goals.length > 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {goals.slice(1, 3).map((goal) => (
                    <GoalCard key={goal.id} request={goal} />
                  ))}
                </div>
              )}

              {orders.length > 0 && (
                <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                  <CardContent className="p-7">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#2563EB]" />
                      <p className="font-semibold text-[#111827]">Delivery activity</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Campaign items running as part of your plans.
                    </p>
                    <div className="mt-5 space-y-3">
                      {orders.map((order) => {
                        const delivered =
                          order.remains === null
                            ? 0
                            : Math.max(order.quantity - order.remains, 0);
                        const progress =
                          order.quantity > 0
                            ? Math.min(Math.round((delivered / order.quantity) * 100), 100)
                            : 0;

                        return (
                          <div
                            key={order.id}
                            className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="font-semibold text-[#111827]">
                                {order.service?.name || "Campaign item"}
                              </p>
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                                  orderStatusClasses[order.status] ??
                                    "bg-slate-100 text-slate-600"
                                )}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-3">
                              <Progress value={progress} className="h-2 bg-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_26px_70px_rgba(79,70,229,0.24)]">
                <CardContent className="p-7 text-white">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Billing</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                    {walletCurrency} {walletBalance.toFixed(2)}
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                    Your balance covers approved growth plans and any campaign work
                    running inside them.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link to="/add-funds">
                      <Button className="rounded-xl bg-white text-[#111827] hover:bg-white">
                        Add Funds
                      </Button>
                    </Link>
                    <Link to="/goals">
                      <Button
                        variant="outline"
                        className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                      >
                        My Goals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                <CardContent className="p-7">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#2563EB]" />
                    <p className="font-semibold text-[#111827]">Recent payments</p>
                  </div>
                  <div className="mt-5 space-y-3">
                    {payments.length === 0 && (
                      <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-500">
                        No payments recorded yet.
                      </div>
                    )}
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#111827]">
                              {payment.description || "Wallet top-up"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#111827]">
                              +${payment.amount.toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs uppercase text-slate-400">
                              {payment.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Link to="/add-funds" className="block">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                >
                  Manage Billing and Payments
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
