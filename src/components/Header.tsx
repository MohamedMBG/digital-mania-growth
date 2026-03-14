import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { LogOut, Menu, Wallet, X } from "lucide-react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/order", label: "Order" },
    ...(isAuthenticated
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/add-funds", label: "Payments" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <BrandLogo compact />
          </Link>

          <Badge
            variant="outline"
            className="hidden rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 xl:inline-flex"
          >
            {isAuthenticated ? "Account active" : "Create an account to order"}
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
          {isAuthenticated ? (
            <>
              <Link to="/add-funds">
                <Button
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              </Link>
              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600">
                {user?.fullName || user?.email}
              </div>
              <Button
                variant="ghost"
                className="rounded-full text-slate-600 hover:text-[#111827]"
                onClick={() => {
                  void logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="rounded-full text-slate-600 hover:text-[#111827]">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full border-0 bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.24)] hover:bg-[#1d4ed8]">
                  Create Account
                </Button>
              </Link>
            </>
          )}
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
                {isAuthenticated ? (
                  <>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Signed in as {user?.email}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-slate-200 bg-white text-[#111827]"
                      onClick={() => {
                        void logout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl border-slate-200 bg-white text-[#111827]">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-xl border-0 bg-[#2563EB] text-white">
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
