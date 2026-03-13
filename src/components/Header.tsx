import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Wallet, X } from "lucide-react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/order", label: "Order" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/add-funds", label: "Payments" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563EB,#7C3AED)] shadow-[0_14px_32px_rgba(37,99,235,0.2)]">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-[#111827]">
                Digital <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">Mania</span>
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Growth platform</p>
            </div>
          </Link>

          <Badge
            variant="outline"
            className="hidden rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 xl:inline-flex"
          >
            Fast, secure, frontend-ready
          </Badge>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:flex">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#F8FAFC] text-[#111827] shadow-sm"
                    : "text-slate-500 hover:text-[#111827]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/add-funds">
            <Button
              variant="outline"
              className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="rounded-full text-slate-600 hover:text-[#111827]">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="rounded-full border-0 bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container py-4">
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#F8FAFC] text-[#111827]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#111827]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 grid gap-2 border-t border-slate-200 pt-4">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-white text-[#111827]">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl border-0 bg-[#2563EB] text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
