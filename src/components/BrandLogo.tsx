import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

const BrandLogo = ({ className, compact = false }: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logo}
        alt="NEXORA logo"
        className={cn(
          "w-auto object-contain",
          compact ? "h-10" : "h-12"
        )}
      />

      <div className="leading-none">
        <p
          className={cn(
            "font-semibold tracking-[0.48em] text-[#020617]",
            compact ? "text-base" : "text-lg"
          )}
        >
          NEXORA
        </p>
        {!compact && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-slate-400">
            Growth platform
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
