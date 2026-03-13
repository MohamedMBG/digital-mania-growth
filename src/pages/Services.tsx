import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, platforms } from "@/data/services";
import { Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Services = () => {
  const [activePlatform, setActivePlatform] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = services.filter((s) => {
    const matchPlatform = activePlatform === "All" || s.platform === activePlatform;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container">
          <div className="mb-10">
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              All <span className="gradient-text">Services</span>
            </h1>
            <p className="text-muted-foreground">Browse our complete marketplace of social media growth services.</p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activePlatform === p
                      ? "gradient-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Card key={s.id} className="card-hover border-0 bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {s.platform}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {s.deliverySpeed}
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{s.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                    <span>Min: {s.minOrder.toLocaleString()}</span>
                    <span>Max: {s.maxOrder.toLocaleString()}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">${s.pricePerK}</span>
                      <span className="text-sm text-muted-foreground"> / 1K</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/services/${s.id}`}>
                        <Button size="sm" variant="outline">Details</Button>
                      </Link>
                      <Link to={`/services/${s.id}`}>
                        <Button size="sm" className="gradient-primary border-0 text-primary-foreground hover:opacity-90">
                          Order
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">No services found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
