import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services } from "@/data/services";
import { Clock, Shield, RefreshCcw, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ServiceDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const service = services.find((s) => s.id === id);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Service not found.</p>
          <Link to="/services">
            <Button className="mt-4" variant="outline">Back to Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPrice = ((quantity / 1000) * service.pricePerK).toFixed(2);
  const clampedQty = Math.min(Math.max(quantity, service.minOrder), service.maxOrder);

  const handleOrder = () => {
    if (!link.trim()) {
      toast({ title: "Link required", description: "Please enter your social media link.", variant: "destructive" });
      return;
    }
    toast({ title: "Order placed!", description: `${clampedQty.toLocaleString()} ${service.name} for $${totalPrice}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container max-w-4xl">
          <Link to="/services" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Info */}
            <div className="lg:col-span-3">
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {service.platform}
              </span>
              <h1 className="mb-4 text-3xl font-bold text-foreground">{service.name}</h1>
              <p className="mb-8 text-muted-foreground leading-relaxed">{service.description}</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Clock, label: "Delivery", value: service.deliverySpeed },
                  { icon: Shield, label: "Guarantee", value: service.guarantee },
                  { icon: RefreshCcw, label: "Refill", value: service.refillPolicy },
                  { icon: Check, label: "Quality", value: "Premium" },
                ].map((item) => (
                  <Card key={item.label} className="border-0 bg-card shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <item.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order form */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-card shadow-lg sticky top-24">
                <CardContent className="p-6">
                  <h3 className="mb-6 text-lg font-semibold text-foreground">Place Order</h3>

                  <div className="space-y-4">
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
                        min={service.minOrder}
                        max={service.maxOrder}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Min: {service.minOrder.toLocaleString()} — Max: {service.maxOrder.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-background p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold text-foreground">${totalPrice}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground text-right">
                        ${service.pricePerK} per 1,000
                      </p>
                    </div>

                    <Button
                      className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90"
                      size="lg"
                      onClick={handleOrder}
                    >
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetails;
