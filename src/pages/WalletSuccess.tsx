import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, RefreshCcw, Wallet } from "lucide-react";

const WalletSuccess = () => {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container max-w-4xl">
          <Badge
            variant="outline"
            className="rounded-full border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-700"
          >
            Payment submitted
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
            Your payment was received by Stripe
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            We are now waiting for the secure webhook confirmation from Stripe.
            Your wallet balance will update automatically as soon as the payment is verified.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <CardContent className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                  What happens next
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
                  <p>Stripe completes the hosted checkout process.</p>
                  <p>Your backend verifies the payment through the signed webhook.</p>
                  <p>The wallet is credited only after verification succeeds.</p>
                  <p>You can return to your dashboard and refresh after a few seconds if needed.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <RefreshCcw className="h-4 w-4 text-[#2563EB]" />
                    Balance updates after webhook confirmation
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <Wallet className="h-4 w-4 text-[#2563EB]" />
                    Wallet funds become available for new orders
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <Link to="/dashboard">
                    <Button className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/add-funds">
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                    >
                      Back to Wallet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WalletSuccess;
