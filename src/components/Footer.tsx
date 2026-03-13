import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Services", to: "/services" },
      { label: "Order", to: "/order" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Payments", to: "/add-funds" },
    ],
  },
  {
    title: "Growth Channels",
    links: [
      { label: "Instagram", to: "/services" },
      { label: "TikTok", to: "/services" },
      { label: "YouTube", to: "/services" },
      { label: "Spotify", to: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" },
      { label: "Security", to: "/add-funds" },
      { label: "Support", to: "/dashboard" },
      { label: "Status", to: "/dashboard" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563EB,#7C3AED)] shadow-[0_12px_28px_rgba(37,99,235,0.18)]">
                <span className="text-sm font-bold text-white">D</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-[#111827]">Digital Mania</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Modern SMM workflow</p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              A premium frontend-first SMM platform for discovering services, placing orders quickly, managing wallet funds, and checking campaign performance in one clean flow.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Secure checkout", "Instant funding", "Fast ordering"].map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{group.title}</p>
              <div className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm text-slate-600 transition-colors hover:text-[#111827]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Digital Mania. Frontend concept experience.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span>Stripe-style workflow</span>
            <span>Luxury minimal UI</span>
            <span>Payments ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
