import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getGrowthPlatform,
  getTimeframeLabel,
  growthPlanStatusMeta,
  growthStatusMeta,
  type GrowthRequestStatus,
} from "@/data/growth";
import { getApiErrorMessage } from "@/lib/api";
import {
  adminAddGrowthProgress,
  adminListGrowthRequests,
  adminUpdateGrowthRequest,
  adminUpsertGrowthPlan,
  type GrowthRequest,
} from "@/lib/growth-api";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Loader2, MessageSquare, Search } from "lucide-react";

const statusOptions: GrowthRequestStatus[] = [
  "submitted",
  "under_review",
  "plan_ready",
  "active",
  "paused",
  "completed",
];

type PlanDraft = {
  title: string;
  summary: string;
  strategy: string;
  components: string;
  estimatedTimeline: string;
  price: string;
  notes: string;
};

const emptyDraft: PlanDraft = {
  title: "",
  summary: "",
  strategy: "",
  components: "",
  estimatedTimeline: "",
  price: "",
  notes: "",
};

const AdminGrowth = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GrowthRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GrowthRequestStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  const [internalNotes, setInternalNotes] = useState("");
  const [progressValue, setProgressValue] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await adminListGrowthRequests({
        ...(statusFilter === "all" ? {} : { status: statusFilter }),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setRequests(response.data);
    } catch (error) {
      toast({
        title: "Growth requests failed to load",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  const selectRequest = (request: GrowthRequest) => {
    setSelectedId(request.id);
    setInternalNotes(request.internalNotes ?? "");
    setProgressValue("");
    setProgressNote("");
    setDraft(
      request.plan
        ? {
            title: request.plan.title,
            summary: request.plan.summary,
            strategy: request.plan.strategy,
            components: request.plan.components.join(", "),
            estimatedTimeline: request.plan.estimatedTimeline ?? "",
            price: request.plan.price === null ? "" : String(request.plan.price),
            notes: request.plan.notes ?? "",
          }
        : emptyDraft
    );
  };

  const applyUpdate = (updated: GrowthRequest) => {
    setRequests((previous) =>
      previous.map((request) => (request.id === updated.id ? updated : request))
    );
  };

  const runAction = async (
    key: string,
    action: () => Promise<{ data: GrowthRequest }>,
    successMessage: string
  ) => {
    if (busyAction) return;

    setBusyAction(key);

    try {
      const response = await action();
      applyUpdate(response.data);
      toast({ title: successMessage });
    } catch (error) {
      toast({
        title: "Action failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const savePlan = (status: "draft" | "shared") => {
    if (!selected) return;

    const price = draft.price.trim() ? Number(draft.price) : undefined;

    if (price !== undefined && Number.isNaN(price)) {
      toast({ title: "Price must be a number", variant: "destructive" });
      return;
    }

    void runAction(
      `plan-${status}`,
      () =>
        adminUpsertGrowthPlan(selected.id, {
          title: draft.title.trim(),
          summary: draft.summary.trim(),
          strategy: draft.strategy.trim(),
          components: draft.components
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          ...(draft.estimatedTimeline.trim()
            ? { estimatedTimeline: draft.estimatedTimeline.trim() }
            : {}),
          ...(price !== undefined ? { price } : {}),
          ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
          status,
        }),
      status === "shared" ? "Plan shared with the customer." : "Draft saved."
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-14">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
            >
              Admin
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
              Growth requests
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Review incoming goals, prepare personalized plans and record real
              audience readings.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, profile or company"
                className="h-12 rounded-xl border-slate-200 bg-white pl-11"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as GrowthRequestStatus | "all")
              }
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white sm:w-56">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {growthStatusMeta[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              {isLoading ? (
                [0, 1, 2].map((key) => (
                  <Skeleton key={key} className="h-32 rounded-[1.5rem]" />
                ))
              ) : requests.length === 0 ? (
                <Card className="rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC]">
                  <CardContent className="p-8 text-sm text-slate-500">
                    No growth requests match this filter.
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => {
                  const platform = getGrowthPlatform(request.platform);
                  const status = growthStatusMeta[request.status];
                  const active = request.id === selectedId;

                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => selectRequest(request)}
                      className={cn(
                        "w-full rounded-[1.5rem] border p-5 text-left transition-all duration-300 ease-out",
                        active
                          ? "border-[#2563EB]/30 bg-[#2563EB]/5 shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-[#111827]">
                          {request.contactName}
                          {request.companyName ? ` — ${request.companyName}` : ""}
                        </p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-sm text-slate-500">
                        {platform?.name} · {request.profile}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        {request.currentAudience.toLocaleString()} →{" "}
                        <span className="font-semibold text-[#111827]">
                          {request.targetAudience.toLocaleString()}
                        </span>{" "}
                        · {getTimeframeLabel(request.timeframe)}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {request.email}
                        {request.phone ? ` · ${request.phone}` : ""}
                        {request.country ? ` · ${request.country}` : ""} ·{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            <div>
              {selected ? (
                <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                  <CardContent className="space-y-8 p-7">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        Status
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={busyAction !== null}
                            onClick={() =>
                              void runAction(
                                `status-${status}`,
                                () =>
                                  adminUpdateGrowthRequest(selected.id, { status }),
                                "Status updated."
                              )
                            }
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm transition-all duration-300 ease-out",
                              selected.status === status
                                ? "border-[#2563EB]/30 bg-[#2563EB]/5 font-semibold text-[#2563EB]"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {growthStatusMeta[status].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selected.ticketId && (
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                          Private thread
                        </p>
                        <Link
                          to={`/tickets/${selected.ticketId}`}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-slate-50"
                        >
                          <MessageSquare className="h-4 w-4 text-[#2563EB]" />
                          Reply to the customer
                        </Link>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="admin-notes">Internal notes</Label>
                      <Textarea
                        id="admin-notes"
                        value={internalNotes}
                        onChange={(event) => setInternalNotes(event.target.value)}
                        placeholder="Only visible to the TrendK team"
                        className="mt-2 min-h-24 rounded-2xl border-slate-200 bg-white"
                      />
                      <Button
                        variant="outline"
                        className="mt-3 rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                        disabled={busyAction !== null}
                        onClick={() =>
                          void runAction(
                            "notes",
                            () =>
                              adminUpdateGrowthRequest(selected.id, {
                                internalNotes,
                              }),
                            "Notes saved."
                          )
                        }
                      >
                        {busyAction === "notes" && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Notes
                      </Button>
                    </div>

                    <div className="border-t border-slate-200 pt-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                          Personalized plan
                        </p>
                        {selected.plan && (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              growthPlanStatusMeta[selected.plan.status].className
                            )}
                          >
                            {growthPlanStatusMeta[selected.plan.status].label}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-4">
                        <div>
                          <Label htmlFor="plan-title">Title</Label>
                          <Input
                            id="plan-title"
                            value={draft.title}
                            onChange={(event) =>
                              setDraft({ ...draft, title: event.target.value })
                            }
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plan-summary">Summary</Label>
                          <Textarea
                            id="plan-summary"
                            value={draft.summary}
                            onChange={(event) =>
                              setDraft({ ...draft, summary: event.target.value })
                            }
                            className="mt-2 min-h-20 rounded-2xl border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plan-strategy">Strategy</Label>
                          <Textarea
                            id="plan-strategy"
                            value={draft.strategy}
                            onChange={(event) =>
                              setDraft({ ...draft, strategy: event.target.value })
                            }
                            className="mt-2 min-h-40 rounded-2xl border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plan-components">
                            Included components (comma separated)
                          </Label>
                          <Input
                            id="plan-components"
                            value={draft.components}
                            onChange={(event) =>
                              setDraft({ ...draft, components: event.target.value })
                            }
                            placeholder="Profile positioning, Content strategy, Growth monitoring"
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="plan-timeline">Estimated timeline</Label>
                            <Input
                              id="plan-timeline"
                              value={draft.estimatedTimeline}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  estimatedTimeline: event.target.value,
                                })
                              }
                              placeholder="4-6 months"
                              className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="plan-price">Price (USD)</Label>
                            <Input
                              id="plan-price"
                              inputMode="decimal"
                              value={draft.price}
                              onChange={(event) =>
                                setDraft({ ...draft, price: event.target.value })
                              }
                              placeholder="1200"
                              className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="plan-notes">Notes</Label>
                          <Textarea
                            id="plan-notes"
                            value={draft.notes}
                            onChange={(event) =>
                              setDraft({ ...draft, notes: event.target.value })
                            }
                            className="mt-2 min-h-20 rounded-2xl border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                          disabled={busyAction !== null || !draft.title.trim()}
                          onClick={() => savePlan("draft")}
                        >
                          {busyAction === "plan-draft" && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Draft
                        </Button>
                        <Button
                          className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                          disabled={busyAction !== null || !draft.title.trim()}
                          onClick={() => savePlan("shared")}
                        >
                          {busyAction === "plan-shared" && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Share With Customer
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-7">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        Record audience reading
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Only enter numbers you have actually verified — this is what
                        the customer sees as progress.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="progress-value">Audience</Label>
                          <Input
                            id="progress-value"
                            inputMode="numeric"
                            value={progressValue}
                            onChange={(event) => setProgressValue(event.target.value)}
                            placeholder="4870"
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="progress-note">Note (optional)</Label>
                          <Input
                            id="progress-note"
                            value={progressNote}
                            onChange={(event) => setProgressNote(event.target.value)}
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                        disabled={busyAction !== null || !progressValue.trim()}
                        onClick={() => {
                          const audience = Number(progressValue.replace(/[^\d]/g, ""));
                          if (!Number.isFinite(audience)) return;

                          void runAction(
                            "progress",
                            () =>
                              adminAddGrowthProgress(selected.id, {
                                audience,
                                ...(progressNote.trim()
                                  ? { note: progressNote.trim() }
                                  : {}),
                              }),
                            "Reading recorded."
                          ).then(() => {
                            setProgressValue("");
                            setProgressNote("");
                          });
                        }}
                      >
                        {busyAction === "progress" && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Record Reading
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC]">
                  <CardContent className="p-10 text-sm text-slate-500">
                    Select a growth request to review it and prepare a plan.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminGrowth;
