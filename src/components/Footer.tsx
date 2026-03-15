import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/BrandLogo";

const footerLinks = [
  {
    title: "Services",
    links: [
      { label: "Growth Solutions", to: "/services" },
      { label: "Campaign Orders", to: "/order" },
      { label: "Client Dashboard", to: "/dashboard" },
      { label: "Billing & Wallet", to: "/add-funds" },
    ],
  },
  {
    title: "Channels",
    links: [
      { label: "Instagram", to: "/services" },
      { label: "TikTok", to: "/services" },
      { label: "YouTube", to: "/services" },
      { label: "Spotify", to: "/services" },
    ],
  },
  {
    title: "Agency",
    links: [
      { label: "About Nexora", to: "/" },
      { label: "Trust & Security", to: "/add-funds" },
      { label: "Client Support", to: "/dashboard" },
      { label: "Platform Status", to: "/dashboard" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center">
              <BrandLogo />
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              Nexora is a digital growth agency focused on premium social media
              campaigns, streamlined client delivery, and dependable account support
              for brands, creators, and modern businesses.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Agency-grade support", "Secure billing", "Reliable delivery"].map(
                (item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {item}
                  </Badge>
                )
              )}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                {group.title}
              </p>
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
          <p>&copy; 2026 NEXORA. Strategic growth services for modern brands.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span>Campaign strategy</span>
            <span>Trusted execution</span>
            <span>Professional support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
