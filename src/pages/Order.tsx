import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/services";
import { useToast } from "@/hooks/use-toast";

const Order = () => {
  const { toast } = useToast();
  const [serviceId, setServiceId] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);

  const selected = services.find((s) => s.id === serviceId);
  const totalPrice = selected ? ((quantity / 1000) * selected.pricePerK).toFixed(2) : "0.00";

  const handleSubmit = () => {
    if (!serviceId || !link.trim()) {
      toast({ title: "Missing fields", description: "Please select a service and enter your link.", variant: "destructive" });
      return;
    }
    toast({ title: "Order placed!", description: `${quantity.toLocaleString()} ${selected?.name} for $${totalPrice}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container max-w-xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold text-foreground">
              New <span className="gradient-text">Order</span>
            </h1>
            <p className="text-muted-foreground">Place your order in seconds. Fast and simple.</p>
          </div>

          <Card className="border-0 bg-card shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block text-sm">Service</Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — ${s.pricePerK}/1K
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm">Your Link</Label>
                  <Input
                    placeholder="https://instagram.com/yourprofile"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm">Quantity</Label>
                  <Input
                    type="number"
                    min={selected?.minOrder || 100}
                    max={selected?.maxOrder || 100000}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  {selected && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Min: {selected.minOrder.toLocaleString()} — Max: {selected.maxOrder.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-background p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Price</span>
                    <span className="text-3xl font-bold text-foreground">${totalPrice}</span>
                  </div>
                  {selected && (
                    <p className="mt-1 text-xs text-muted-foreground text-right">
                      {quantity.toLocaleString()} × ${selected.pricePerK}/1K
                    </p>
                  )}
                </div>

                <Button
                  className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90"
                  size="lg"
                  onClick={handleSubmit}
                >
                  Place Order
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

export default Order;
