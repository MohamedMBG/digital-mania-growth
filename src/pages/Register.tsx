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
import { CheckCircle2, Sparkles } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";

const Register = () => {
  const { toast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await register(name, email, password);
      toast({ title: "Account created", description: "Your account is ready. You can continue now." });
      navigate(redirect);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
            <div className="max-w-xl">
              <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Create account
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                Create an account before placing an order
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Orders and dashboard access are reserved for platform members. Open an account with Google or email and password to continue.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Required before checkout",
                  "Email sign-up is live now",
                  "Dashboard unlocked after registration",
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
                    <Sparkles className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Get started</p>
                    <p className="text-lg font-semibold text-[#111827]">Open your account</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
                  disabled
                >
                  Google sign-up coming soon
                </Button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-600">Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      required
                    />
                  </div>
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
                      placeholder="Choose a secure password"
                      className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                      required
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                    {submitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-[#2563EB] hover:underline">
                    Sign in
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

export default Register;
