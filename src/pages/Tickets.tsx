import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LifeBuoy, Plus } from "lucide-react";
import { apiRequestWithRefresh, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type TicketListItem = {
  id: string;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
};

const statusClasses: Record<string, string> = {
  open: "bg-amber-50 text-amber-700",
  answered: "bg-blue-50 text-blue-600",
  resolved: "bg-emerald-50 text-emerald-600",
  closed: "bg-slate-100 text-slate-600",
};

const Tickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    try {
      const response = await apiRequestWithRefresh<{ data: TicketListItem[] }>(
        "/tickets?limit=50"
      );
      setTickets(response.data);
    } catch (error) {
      toast({
        title: "Could not load tickets",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (subject.trim().length < 3 || message.trim().length < 1) {
      toast({
        title: "Missing information",
        description: "Add a subject (min 3 chars) and a message before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiRequestWithRefresh("/tickets", {
        method: "POST",
        body: {
          subject: subject.trim(),
          message: message.trim(),
          ...(orderId.trim() ? { orderId: orderId.trim() } : {}),
        },
      });
      setSubject("");
      setMessage("");
      setOrderId("");
      toast({ title: "Ticket created", description: "Our team will reply shortly." });
      await loadTickets();
    } catch (error) {
      toast({
        title: "Could not create ticket",
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

      <section className="border-b border-slate-200 bg-white py-16">
        <div className="container">
          <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Support
          </Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#111827] md:text-5xl">
            Help &amp; support tickets
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Open a ticket for order issues or account questions and follow the conversation here.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container grid gap-8 xl:grid-cols-[1fr_1fr]">
          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-7">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-xl font-semibold text-[#111827]">Open a new ticket</h2>
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-600">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order not delivered"
                  className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-600">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  className="min-h-[140px] rounded-xl border-slate-200 bg-[#F8FAFC]"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-600">
                  Related order ID <span className="text-slate-400">(optional)</span>
                </Label>
                <Input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="order id"
                  className="h-12 rounded-xl border-slate-200 bg-[#F8FAFC]"
                />
              </div>
              <Button
                className="h-12 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                onClick={() => void handleCreate()}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit ticket"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
            <CardContent className="p-7">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-xl font-semibold text-[#111827]">Your tickets</h2>
              </div>
              <div className="mt-5 space-y-3">
                {tickets.length === 0 && (
                  <div className="rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-6 text-sm text-slate-500">
                    No tickets yet.
                  </div>
                )}
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block rounded-[1.25rem] border border-slate-200 bg-[#F8FAFC] p-5 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#111827]">{ticket.subject}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {ticket._count?.messages ?? 0} message(s) •{" "}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusClasses[ticket.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-[#2563EB]">
                      View conversation
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tickets;
