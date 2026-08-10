import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardNav from "@/components/dashboard/DashboardNav";
import GoalCard from "@/components/growth/GoalCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import { listMyGrowthRequests, type GrowthRequest } from "@/lib/growth-api";
import { fadeUp } from "@/lib/motion";
import { ArrowRight, Target } from "lucide-react";

const GrowthGoals = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GrowthRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listMyGrowthRequests();
        setRequests(response.data);
      } catch (error) {
        toast({
          title: "Goals failed to load",
          description: getApiErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [toast]);

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-14">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
            >
              My goals
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
              Every goal you've set with TrendK
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Track where each request stands, from first submission to an active
              growth plan.
            </p>
            <div className="mt-8">
              <DashboardNav />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1].map((key) => (
                <Skeleton key={key} className="h-72 rounded-[1.75rem]" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <CardContent className="flex flex-col items-start gap-5 p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Target className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    No goals yet
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
                    Tell us where you want your account to go and our team will come
                    back with a personalized plan.
                  </p>
                </div>
                <a href="/#goal-builder">
                  <Button className="h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]">
                    Build My Growth Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {requests.map((request) => (
                <GoalCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GrowthGoals;
