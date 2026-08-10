import { cn } from "@/lib/utils";
import logo from "@/assets/trendk-logo.png";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

const BrandLogo = ({ className, compact = false }: BrandLogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={logo}
        alt="TrendK logo"
        className={cn(
          "w-auto object-contain",
          compact ? "h-10" : "h-12"
        )}
      />
    </div>
  );
};

export default BrandLogo;
