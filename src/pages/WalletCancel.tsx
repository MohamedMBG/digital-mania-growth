import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, XCircle } from "lucide-react";

const WalletCancel = () => {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container max-w-4xl">
          <Badge
            variant="outline"
            className="rounded-full border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-amber-700"
          >
            Checkout canceled
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
            No payment was added to your wallet
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Your Stripe session was canceled before completion. You can safely return
            to the wallet and try again whenever you are ready.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <CardContent className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                  <XCircle className="h-7 w-7 text-amber-600" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                  You can retry anytime
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
                  <p>Your wallet balance has not changed.</p>
                  <p>No funds are credited unless Stripe checkout completes and the webhook is verified.</p>
                  <p>You can return to billing and start a new secure checkout session in a few clicks.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-[#F8FAFC] shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <CreditCard className="h-4 w-4 text-[#2563EB]" />
                    Start a new Stripe checkout session
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <ArrowLeft className="h-4 w-4 text-[#2563EB]" />
                    Return to your wallet and choose a new amount
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <Link to="/add-funds">
                    <Button className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                      Back to Wallet
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                    >
                      Return to Dashboard
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

export default WalletCancel;
