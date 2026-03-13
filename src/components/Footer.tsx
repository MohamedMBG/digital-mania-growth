import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    {
      title: "Services",
      links: [
        { label: "Instagram", to: "/services" },
        { label: "TikTok", to: "/services" },
        { label: "YouTube", to: "/services" },
        { label: "Twitter", to: "/services" },
        { label: "Spotify", to: "/services" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", to: "#" },
        { label: "API", to: "#" },
        { label: "Affiliate", to: "#" },
        { label: "Blog", to: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", to: "#" },
        { label: "Contact", to: "#" },
        { label: "Status", to: "#" },
        { label: "FAQ", to: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", to: "#" },
        { label: "Privacy Policy", to: "#" },
        { label: "Refund Policy", to: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Digital <span className="gradient-text">Mania</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The most trusted social media growth platform. Fast, secure, and reliable services for creators and businesses.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Digital Mania. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">Secure Payments</span>
            <span className="text-xs text-muted-foreground">24/7 Support</span>
            <span className="text-xs text-muted-foreground">Instant Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
