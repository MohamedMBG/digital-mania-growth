import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, Lock, Send, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import {
  addTicketMessage,
  getTicket,
  ticketStatusMeta,
  type Ticket,
} from "@/lib/tickets-api";
import { cn } from "@/lib/utils";

type GoalThreadProps = {
  ticketId: string | null;
  /** Suggested opening line when the customer has nothing to say yet. */
  placeholder?: string;
  className?: string;
};

/**
 * The private conversation attached to one goal. The assistant answers here and
 * places the order itself once the wallet covers the quote; a human steps in
 * whenever the customer asks for one.
 */
const GoalThread = ({ ticketId, placeholder, className }: GoalThreadProps) => {
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!ticketId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getTicket(ticketId);
      setTicket(response.data);
    } catch (error) {
      toast({
        title: "Could not open your thread",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [ticket?.messages.length]);

  const handleSend = async (override?: string) => {
    const body = (override ?? draft).trim();
    if (!ticketId || body.length < 1 || isSending) return;

    setIsSending(true);

    try {
      const response = await addTicketMessage(ticketId, body);
      setTicket(response.data);
      if (!override) setDraft("");
    } catch (error) {
      toast({
        title: "Message not sent",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const closed = ticket?.status === "closed";
  const status = ticket ? ticketStatusMeta[ticket.status] : null;

  return (
    <Card
      className={cn(
        "rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <CardContent className="p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Private thread
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              You and your growth assistant
            </h2>
          </div>
          {status && (
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                status.className
              )}
            >
              {status.label}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-xs text-slate-600">
            <Lock className="h-3.5 w-3.5 text-[#2563EB]" />
            Visible only to you and our team
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-2 text-xs text-slate-600">
            <Zap className="h-3.5 w-3.5 text-[#7C3AED]" />
            Instant answers, human on request
          </span>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-24 w-full rounded-[1.25rem]" />
            <Skeleton className="h-24 w-full rounded-[1.25rem]" />
          </div>
        ) : !ticketId || !ticket ? (
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
            This goal has no thread yet. Goals submitted without an account are
            handled over email instead — sign in and set the goal again to get a
            thread on the site.
          </p>
        ) : (
          <>
            <div className="mt-6 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-[1.25rem] border p-5",
                    message.isStaff
                      ? "border-blue-100 bg-blue-50/50"
                      : "border-slate-200 bg-[#F8FAFC]"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {message.isBot && (
                        <Bot className="h-3.5 w-3.5 text-[#2563EB]" />
                      )}
                      {message.isBot
                        ? "Growth assistant"
                        : message.isStaff
                          ? "Your account manager"
                          : "You"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#111827]">
                    {message.body}
                  </p>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              {!closed && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#2563EB]/25 bg-[#2563EB]/5 text-sm font-semibold text-[#2563EB] hover:bg-[#2563EB]/10"
                    disabled={isSending}
                    onClick={() => void handleSend("CONFIRM")}
                  >
                    Confirm &amp; Start
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 bg-white text-sm text-[#111827] hover:bg-slate-50"
                    disabled={isSending}
                    onClick={() => void handleSend("How much is it?")}
                  >
                    Ask the price
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 bg-white text-sm text-[#111827] hover:bg-slate-50"
                    disabled={isSending}
                    onClick={() => void handleSend("I'd like to talk to a human.")}
                  >
                    Talk to a human
                  </Button>
                  <Link to="/add-funds">
                    <Button
                      variant="ghost"
                      className="rounded-xl text-sm text-slate-500 hover:text-[#111827]"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Add funds
                    </Button>
                  </Link>
                </div>
              )}
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={closed}
                placeholder={
                  closed
                    ? "This thread is closed."
                    : placeholder ??
                      "Tell the team the number you want to reach, your budget and anything else about the account."
                }
                className="min-h-[128px] rounded-2xl border-slate-200 bg-[#F8FAFC]"
              />
              <Button
                className="mt-4 h-12 rounded-xl border-0 bg-[#2563EB] px-6 text-white hover:bg-[#1d4ed8]"
                disabled={closed || isSending || draft.trim().length < 1}
                onClick={() => void handleSend()}
              >
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Message
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalThread;
