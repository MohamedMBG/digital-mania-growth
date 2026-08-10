import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flag, MapPin } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

type GoalArcProps = {
  current: number;
  target: number;
  audienceLabel: string;
  platformName?: string;
  className?: string;
  compact?: boolean;
};

/**
 * The current -> target visual at the heart of the Goal Builder. The travelling
 * indicator represents the distance to the objective, never real progress.
 */
const GoalArc = ({
  current,
  target,
  audienceLabel,
  platformName,
  className,
  compact = false,
}: GoalArcProps) => {
  const shouldReduceMotion = useReducedMotion();
  const animatedCurrent = useAnimatedNumber(current);
  const animatedTarget = useAnimatedNumber(target);

  const multiplier = current > 0 && target > current ? target / current : null;
  const added = target > current ? target - current : 0;

  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-slate-200 bg-[#F8FAFC] p-6",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {platformName ? `${platformName} goal` : "Your growth goal"}
        </p>
        {multiplier && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm">
            {multiplier >= 10 ? multiplier.toFixed(0) : multiplier.toFixed(1)}x objective
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Now</p>
          <p
            className={cn(
              "mt-2 font-semibold tracking-[-0.04em] text-[#111827]",
              compact ? "text-2xl" : "text-3xl"
            )}
          >
            {animatedCurrent.toLocaleString()}
          </p>
        </div>

        <ArrowRight className="mb-2 h-5 w-5 shrink-0 text-slate-300" />

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Goal</p>
          <p
            className={cn(
              "mt-2 bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text font-semibold tracking-[-0.04em] text-transparent",
              compact ? "text-2xl" : "text-4xl"
            )}
          >
            {animatedTarget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#2563EB_0%,#4F46E5_55%,#7C3AED_100%)]"
          initial={false}
          animate={{ width: target > current ? "100%" : "12%" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
        />
        {!shouldReduceMotion && target > current && (
          <motion.span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.35)]"
            initial={{ left: "0%" }}
            animate={{ left: ["0%", "96%"] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
          {current.toLocaleString()} {audienceLabel.toLowerCase()} today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5 text-[#7C3AED]" />
          {added > 0
            ? `+${added.toLocaleString()} to reach your target`
            : "Set a target above your current audience"}
        </span>
      </div>
    </div>
  );
};

export default GoalArc;
