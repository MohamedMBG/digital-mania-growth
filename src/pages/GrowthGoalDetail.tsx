import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardNav from "@/components/dashboard/DashboardNav";
import GoalArc from "@/components/growth/GoalArc";
import GoalThread from "@/components/growth/GoalThread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getGrowthPlatform,
  getTimeframeLabel,
  growthPlanStatusMeta,
  growthStatusMeta,
  whatHappensNext,
} from "@/data/growth";
import { getApiErrorMessage } from "@/lib/api";
import {
  getGoalProgress,
  getGrowthRequest,
  respondToGrowthPlan,
  type GrowthRequest,
} from "@/lib/growth-api";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2, MessageSquare } from "lucide-react";

const GrowthGoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [request, setRequest] = useState<GrowthRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [changeNote, setChangeNote] = useState("");
  const [pendingDecision, setPendingDecision] = useState<
    "accept" | "request_changes" | null
  >(null);
  const [tab, setTab] = useState("thread");

  const load = useCallback(async () => {
    if (!id) return;

    try {
      const response = await getGrowthRequest(id);
      setRequest(response.data);
    } catch (error) {
      toast({
        title: "Goal failed to load",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDecision = async (decision: "accept" | "request_changes") => {
    if (!id || pendingDecision) return;

    setPendingDecision(decision);

    try {
      const response = await respondToGrowthPlan(
        id,
        decision,
        decision === "request_changes" ? changeNote.trim() || undefined : undefined
      );
      setRequest(response.data);
      setChangeNote("");
      toast({
        title:
          decision === "accept" ? "Plan accepted" : "Change request sent",
        description:
          decision === "accept"
            ? "Our team will be in touch to start execution."
            : "We'll review your notes and come back to you.",
      });
    } catch (error) {
      toast({
        title: "We could not record your response",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setPendingDecision(null);
    }
  };

  const platform = request ? getGrowthPlatform(request.platform) : undefined;
  const status = request ? growthStatusMeta[request.status] : null;
  const progress = request ? getGoalProgress(request) : null;
  const plan = request?.plan ?? null;
  const chartData =
    request?.progressSnapshots.map((snapshot) => ({
      date: new Date(snapshot.recordedAt).toLocaleDateString(),
      audience: snapshot.audience,
    })) ?? [];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-14">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Link
              to="/goals"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#111827]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to my goals
            </Link>

            {isLoading ? (
              <Skeleton className="mt-6 h-16 w-full max-w-2xl rounded-2xl" />
            ) : request && status ? (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
                  >
                    {platform?.name} goal
                  </Badge>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </div>
                <h1 className="mt-5 break-all text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
                  {request.profile}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  {status.description}
                </p>
              </>
            ) : (
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
                Goal not found
              </h1>
            )}

            <div className="mt-8">
              <DashboardNav />
            </div>
          </motion.div>
        </div>
      </section>

      {request && (
        <section className="bg-white py-12">
          <div className="container">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Tabs value={tab} onValueChange={setTab} className="space-y-6">
                <TabsList className="rounded-full bg-[#F8FAFC] p-1">
                  <TabsTrigger value="thread" className="rounded-full px-5">
                    Private Thread
                  </TabsTrigger>
                  <TabsTrigger value="plan" className="rounded-full px-5">
                    Growth Plan
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="rounded-full px-5">
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="details" className="rounded-full px-5">
                    Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="thread">
                  <GoalThread
                    ticketId={request.ticketId}
                    placeholder={`Tell the team the ${
                      platform?.audienceLabel.toLowerCase() ?? "audience"
                    } number you want to reach, your budget and how fast you need it.`}
                  />
                </TabsContent>

                <TabsContent value="plan">
                  <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-7">
                      {plan ? (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                                Your plan
                              </p>
                              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                                {plan.title}
                              </h2>
                            </div>
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                                growthPlanStatusMeta[plan.status].className
                              )}
                            >
                              {growthPlanStatusMeta[plan.status].label}
                            </span>
                          </div>

                          <p className="mt-5 text-base leading-8 text-slate-600">
                            {plan.summary}
                          </p>

                          <div className="mt-7 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Recommended strategy
                            </p>
                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                              {plan.strategy}
                            </p>
                          </div>

                          {plan.components.length > 0 && (
                            <div className="mt-6">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Included components
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {plan.components.map((component) => (
                                  <span
                                    key={component}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm"
                                  >
                                    {component}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                Estimated timeline
                              </p>
                              <p className="mt-2 text-lg font-semibold text-[#111827]">
                                {plan.estimatedTimeline ?? "Shared on request"}
                              </p>
                            </div>
                            <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                Price
                              </p>
                              <p className="mt-2 text-lg font-semibold text-[#111827]">
                                {plan.price === null
                                  ? "Shared on request"
                                  : `${plan.currency} ${plan.price.toFixed(2)}`}
                              </p>
                            </div>
                          </div>

                          {plan.notes && (
                            <p className="mt-6 text-sm leading-7 text-slate-500">
                              {plan.notes}
                            </p>
                          )}

                          {plan.status === "shared" ? (
                            <div className="mt-8 border-t border-slate-200 pt-6">
                              <Textarea
                                value={changeNote}
                                onChange={(event) => setChangeNote(event.target.value)}
                                placeholder="Anything you'd like changed? (optional)"
                                className="min-h-24 rounded-2xl border-slate-200 bg-white"
                              />
                              <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                  className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
                                  disabled={pendingDecision !== null}
                                  onClick={() => void handleDecision("accept")}
                                >
                                  {pendingDecision === "accept" ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                  )}
                                  Accept Plan
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-12 rounded-xl border-slate-200 bg-white px-6 text-[#111827] hover:bg-slate-50"
                                  disabled={pendingDecision !== null}
                                  onClick={() => void handleDecision("request_changes")}
                                >
                                  {pendingDecision === "request_changes" && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Request Changes
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-12 rounded-xl text-slate-500 hover:text-[#111827]"
                                  onClick={() => setTab("thread")}
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Message the Team
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-8 border-t border-slate-200 pt-6">
                              {plan.customerNote && (
                                <p className="mb-4 text-sm leading-7 text-slate-500">
                                  Your note: "{plan.customerNote}"
                                </p>
                              )}
                              <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                                onClick={() => setTab("thread")}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message the Team
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                            Plan in preparation
                          </p>
                          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                            We're working on it
                          </h2>
                          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                            Your plan appears here as soon as our team has finished
                            reviewing your account.
                          </p>
                          <ol className="mt-6 space-y-4">
                            {whatHappensNext.map((item, index) => (
                              <li key={item} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.10),rgba(124,58,237,0.14))] text-xs font-semibold text-[#2563EB]">
                                  {index + 1}
                                </span>
                                <span className="text-sm leading-6 text-slate-600">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress">
                  <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-7">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        Progress
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                        Audience readings
                      </h2>

                      {request.progressSnapshots.length === 0 ? (
                        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                          No readings recorded yet. Once your plan is active, our
                          team records your audience here so progress reflects real
                          numbers.
                        </p>
                      ) : (
                        <>
                          <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            {[
                              {
                                label: "Starting audience",
                                value: request.currentAudience.toLocaleString(),
                              },
                              {
                                label: "Current audience",
                                value: request.latestAudience?.toLocaleString() ?? "—",
                              },
                              {
                                label: "Growth goal",
                                value: request.targetAudience.toLocaleString(),
                              },
                            ].map((stat) => (
                              <div
                                key={stat.label}
                                className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-5"
                              >
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                  {stat.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {progress !== null && (
                            <div className="mt-6">
                              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                                <span>Toward your goal</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2 bg-[#F8FAFC]" />
                            </div>
                          )}

                          <div className="mt-8 h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <XAxis
                                  dataKey="date"
                                  stroke="#94a3b8"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  stroke="#94a3b8"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  width={56}
                                />
                                <RechartsTooltip />
                                <Line
                                  type="monotone"
                                  dataKey="audience"
                                  stroke="#4F46E5"
                                  strokeWidth={2.5}
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="mt-8 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Growth history
                            </p>
                            {[...request.progressSnapshots]
                              .reverse()
                              .map((snapshot) => (
                                <div
                                  key={snapshot.id}
                                  className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <p className="font-semibold text-[#111827]">
                                      {snapshot.audience.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {new Date(snapshot.recordedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {snapshot.note && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {snapshot.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details">
                  <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-7">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        Submitted details
                      </p>
                      <dl className="mt-6 space-y-4 text-sm">
                        {[
                          { label: "Platform", value: platform?.name ?? request.platform },
                          { label: "Account", value: request.profile },
                          {
                            label: "Starting audience",
                            value: request.currentAudience.toLocaleString(),
                          },
                          {
                            label: "Growth goal",
                            value: request.targetAudience.toLocaleString(),
                          },
                          {
                            label: "Desired timeframe",
                            value: getTimeframeLabel(request.timeframe),
                          },
                          { label: "Niche", value: request.niche },
                          { label: "Company", value: request.companyName },
                          { label: "Website", value: request.website },
                          { label: "Industry", value: request.industry },
                          { label: "Target market", value: request.targetMarket },
                          { label: "Country", value: request.country },
                          { label: "Contact", value: request.contactName },
                          { label: "Email", value: request.email },
                          { label: "Phone", value: request.phone },
                          {
                            label: "Submitted",
                            value: new Date(request.createdAt).toLocaleDateString(),
                          },
                        ]
                          .filter((row) => row.value)
                          .map((row) => (
                            <div
                              key={row.label}
                              className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
                            >
                              <dt className="text-slate-500">{row.label}</dt>
                              <dd className="break-all text-right font-semibold text-[#111827]">
                                {row.value}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="space-y-6">
                <GoalArc
                  current={request.currentAudience}
                  target={request.targetAudience}
                  audienceLabel={platform?.audienceLabel ?? "Audience"}
                  platformName={platform?.name}
                  className="border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                />

                <Card className="rounded-[2rem] border-0 bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)] shadow-[0_26px_70px_rgba(79,70,229,0.24)]">
                  <CardContent className="p-7 text-white">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                      Need to talk it through?
                    </p>
                    <p className="mt-3 text-lg leading-8 text-white/85">
                      Everything about this goal — the number you want to reach,
                      timing, budget — is handled privately in your thread. Your
                      assistant answers instantly and a human takes over on
                      request.
                    </p>
                    <Button
                      className="mt-6 rounded-xl bg-white text-[#111827] hover:bg-white"
                      onClick={() => setTab("thread")}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Private Thread
                    </Button>
                  </CardContent>
                </Card>

                <p className="px-2 text-xs leading-6 text-slate-400">
                  Your target is the objective we plan toward. Social media
                  performance depends on many factors, so TrendK recommends a
                  realistic strategy and timeline rather than promising a number.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default GrowthGoalDetail;
