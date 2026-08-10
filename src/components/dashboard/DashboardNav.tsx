import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Overview" },
  { to: "/goals", label: "My Goals" },
  { to: "/tickets", label: "Messages" },
  { to: "/add-funds", label: "Billing" },
];

/**
 * Workspace navigation. Uses the same pill treatment as the site header so the
 * dashboard reads as one system with the marketing pages.
 */
const DashboardNav = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      {items.map((item) => {
        const active =
          location.pathname === item.to ||
          (item.to !== "/dashboard" && location.pathname.startsWith(item.to));

        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-[#F8FAFC] text-[#111827] shadow-sm"
                : "text-slate-500 hover:text-[#111827]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default DashboardNav;
