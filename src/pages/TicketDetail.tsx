import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { apiRequestWithRefresh, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

type TicketMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  isBot: boolean;
  authorId: string;
  createdAt: string;
};

type TicketDetailData = {
  id: string;
  subject: string;
  status: string;
  orderId: string | null;
  createdAt: string;
  order?: { id: string; status: string } | null;
  messages: TicketMessage[];
};

const statusClasses: Record<string, string> = {
  open: "bg-amber-50 text-amber-700",
  answered: "bg-blue-50 text-blue-600",
  resolved: "bg-emerald-50 text-emerald-600",
  closed: "bg-slate-100 text-slate-600",
};

const STAFF_STATUSES = ["answered", "resolved", "closed", "open"];

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "support";

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTicket = async () => {
    if (!id) return;
    try {
      const response = await apiRequestWithRefresh<{ data: TicketDetailData }>(
        `/tickets/${id}`
      );
      setTicket(response.data);
    } catch (error) {
      toast({
        title: "Could not load ticket",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReply = async () => {
    if (!id || reply.trim().length < 1) return;
    try {
      setBusy(true);
      await apiRequestWithRefresh(`/tickets/${id}/messages`, {
        method: "POST",
        body: { body: reply.trim() },
      });
      setReply("");
      await loadTicket();
    } catch (error) {
      toast({
        title: "Could not send message",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!id) return;
    try {
      setBusy(true);
      await apiRequestWithRefresh(`/tickets/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await loadTicket();
    } catch (error) {
      toast({
        title: "Could not update status",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const closed = ticket?.status === "closed";

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Header />

      <section className="bg-white py-12">
        <div className="container max-w-3xl">
          <Link
            to="/tickets"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>

          {!ticket ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-6 text-sm text-slate-500">
              Loading ticket...
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
                  {ticket.subject}
                </h1>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusClasses[ticket.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              {ticket.orderId && (
                <p className="mt-2 text-sm text-slate-500">
                  Linked order: {ticket.orderId}
                  {ticket.order ? ` (${ticket.order.status})` : ""}
                </p>
              )}

              {isStaff && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {STAFF_STATUSES.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      className="rounded-xl border-slate-200 bg-white text-xs capitalize text-[#111827] hover:bg-slate-50"
                      disabled={busy || ticket.status === status}
                      onClick={() => void handleStatus(status)}
                    >
                      Mark {status}
                    </Button>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-4">
                {ticket.messages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={`rounded-[1.5rem] border shadow-none ${
                      msg.isStaff
                        ? "border-blue-100 bg-blue-50/50"
                        : "border-slate-200 bg-[#F8FAFC]"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {msg.isBot
                            ? "Growth assistant"
                            : msg.isStaff
                              ? "Support"
                              : "You"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-[#111827]">
                        {msg.body}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white shadow-none">
                <CardContent className="space-y-4 p-5">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={closed ? "This ticket is closed." : "Write a reply..."}
                    disabled={closed}
                    className="min-h-[120px] rounded-xl border-slate-200 bg-[#F8FAFC]"
                  />
                  <Button
                    className="h-11 w-full rounded-xl border-0 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                    onClick={() => void handleReply()}
                    disabled={busy || closed || reply.trim().length < 1}
                  >
                    {busy ? "Sending..." : "Send reply"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TicketDetail;
