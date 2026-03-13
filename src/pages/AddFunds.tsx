import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CreditCard, Bitcoin, DollarSign, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { id: "stripe", name: "Credit Card", desc: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "crypto", name: "Cryptocurrency", desc: "Bitcoin, Ethereum, USDT", icon: Bitcoin },
  { id: "paypal", name: "PayPal", desc: "Fast and secure", icon: DollarSign },
];

const AddFunds = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState("stripe");
  const [amount, setAmount] = useState("25");

  const presets = ["10", "25", "50", "100"];

  const handleSubmit = () => {
    toast({ title: "Funds added!", description: `$${amount} added via ${paymentMethods.find(m => m.id === method)?.name}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container max-w-xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold text-foreground">
              Add <span className="gradient-text">Funds</span>
            </h1>
            <p className="text-muted-foreground">Top up your balance to place orders instantly.</p>
          </div>

          {/* Balance */}
          <Card className="mb-6 border-0 gradient-primary shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-primary-foreground/70">Current Balance</p>
              <p className="text-4xl font-bold text-primary-foreground">$124.50</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Payment method */}
                <div>
                  <Label className="mb-3 block text-sm">Payment Method</Label>
                  <div className="grid gap-3">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setMethod(pm.id)}
                        className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                          method === pm.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <pm.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{pm.name}</p>
                          <p className="text-xs text-muted-foreground">{pm.desc}</p>
                        </div>
                        {method === pm.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label className="mb-3 block text-sm">Amount</Label>
                  <div className="mb-3 flex gap-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAmount(p)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          amount === p
                            ? "gradient-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ${p}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Custom amount"
                  />
                </div>

                <Button
                  className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90"
                  size="lg"
                  onClick={handleSubmit}
                >
                  Add ${amount || "0"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AddFunds;
