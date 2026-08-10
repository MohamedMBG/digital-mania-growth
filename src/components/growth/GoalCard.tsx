import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getGrowthPlatform,
  getTimeframeLabel,
  growthStatusMeta,
} from "@/data/growth";
import { getGoalProgress, type GrowthRequest } from "@/lib/growth-api";
import { cn } from "@/lib/utils";

type GoalCardProps = {
  request: GrowthRequest;
  className?: string;
};

const GoalCard = ({ request, className }: GoalCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const platform = getGrowthPlatform(request.platform);
  const status = growthStatusMeta[request.status];
  const progress = getGoalProgress(request);
  const PlatformIcon = platform?.icon;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
    >
      <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] card-hover">
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC] shadow-inner">
                {PlatformIcon && (
                  <PlatformIcon className={cn("h-6 w-6", platform?.tint)} />
                )}
              </div>
              <div>
                <p className="font-semibold text-[#111827]">{platform?.name}</p>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {request.profile}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                status.className
              )}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Starting
              </p>
              <p className="mt-1 text-xl font-semibold text-[#111827]">
                {request.currentAudience.toLocaleString()}
              </p>
            </div>
            <ArrowRight className="mb-1 h-4 w-4 text-slate-300" />
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Goal
              </p>
              <p className="mt-1 bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-xl font-semibold text-transparent">
                {request.targetAudience.toLocaleString()}
              </p>
            </div>
          </div>

          {progress === null ? (
            <p className="mt-4 text-xs leading-6 text-slate-400">
              Progress appears here once our team records an audience reading.
            </p>
          ) : (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                <span>
                  {request.latestAudience?.toLocaleString()} /{" "}
                  {request.targetAudience.toLocaleString()}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-[#F8FAFC]" />
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-[#2563EB]" />
              {getTimeframeLabel(request.timeframe)}
            </span>
            <span>
              Submitted {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-6 flex flex-1 flex-wrap items-end gap-3">
            <Link to={`/goals/${request.id}`}>
              <Button className="rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                {request.plan ? "View Plan" : "View"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {request.ticketId && (
              <Link to={`/tickets/${request.ticketId}`}>
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {request.ticketStatus === "answered"
                    ? "Team Replied"
                    : "Private Thread"}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalCard;
