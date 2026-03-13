import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Signed in!", description: "Welcome back to Digital Mania." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="flex items-center justify-center py-20">
        <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your Digital Mania account</p>
          </div>

          <Card className="border-0 bg-card shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="mb-2 block text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90" size="lg">
                  Sign In
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
