import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const Login = () => {
  const { toast } = useToast();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    toast({ title: "Signed in", description: "Welcome back to NEXORA." });
    navigate(redirect);
  };

  const handleGoogle = () => {
    loginWithGoogle();
    toast({ title: "Signed in with Google", description: "Your account is ready to continue." });
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_0.8fr] lg:items-center">
            <div className="max-w-xl">
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Secure access
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Sign in to your growth workspace</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Dashboard access and payments are account-only. Sign in to manage orders, wallet funds, and checkout.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Dashboard is only available to account holders",
                  "Orders require an account before checkout",
                  "Google or email sign-in supported",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FAFC]">
                    <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
                    <p className="text-lg font-semibold text-[#111827]">Sign in</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                  onClick={handleGoogle}
                >
                  Continue with Google
                </Button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-600">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-600">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      required
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                    Sign In
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Need an account first?{" "}
                  <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-[#2563EB] hover:underline">
                    Create one
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
