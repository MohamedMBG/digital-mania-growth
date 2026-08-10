import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import BrandLogo from "@/components/BrandLogo";

const footerLinks = [
  {
    title: "Growth",
    links: [
      { label: "How It Works", to: "/how-it-works" },
      { label: "Supported Platforms", to: "/platforms" },
      { label: "For Business", to: "/for-business" },
      { label: "For Creators", to: "/for-creators" },
    ],
  },
  {
    title: "Platforms",
    links: [
      { label: "Instagram Growth", to: "/platforms" },
      { label: "TikTok Growth", to: "/platforms" },
      { label: "YouTube Growth", to: "/platforms" },
      { label: "LinkedIn Growth", to: "/platforms" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "About TrendK", to: "/about" },
      { label: "My Goals", to: "/goals" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Messages", to: "/tickets" },
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
              TrendK is a personalized social media growth service. You tell us
              where your account is today and where you want it to go, and our team
              builds the strategy around it.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Personalized strategy", "Reviewed by our team", "Managed execution"].map(
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
          <p>&copy; 2026 TrendK. Your goal. Our strategy.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span>Growth targets are objectives, not guarantees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
