import { apiRequestWithRefresh } from "@/lib/api";

export type TicketStatus = "open" | "answered" | "resolved" | "closed";

export type TicketMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  /** Written by the automated assistant rather than a human team member. */
  isBot: boolean;
  authorId: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  orderId: string | null;
  createdAt: string;
  order?: { id: string; status: string } | null;
  messages: TicketMessage[];
};

type TicketResponse = { success: true; message: string; data: Ticket };

export const getTicket = (id: string) =>
  apiRequestWithRefresh<TicketResponse>(`/tickets/${id}`);

export const addTicketMessage = (id: string, body: string) =>
  apiRequestWithRefresh<TicketResponse>(`/tickets/${id}/messages`, {
    method: "POST",
    body: { body },
  });

export const ticketStatusMeta: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  open: { label: "Waiting on us", className: "bg-amber-50 text-amber-700" },
  answered: { label: "Team replied", className: "bg-blue-50 text-blue-600" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-600" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600" },
};
