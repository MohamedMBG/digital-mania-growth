import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />
      <section className="py-24">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] md:text-6xl">Page not found</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
            The page you requested does not exist in this frontend workspace. Head back to the main flow and continue exploring the platform.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/">
              <Button className="rounded-xl bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Go Home</Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NotFound;
