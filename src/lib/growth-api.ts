import { apiRequest, apiRequestWithRefresh } from "@/lib/api";
import type { TicketStatus } from "@/lib/tickets-api";
import type {
  GrowthPlanStatus,
  GrowthPlatformId,
  GrowthRequestStatus,
  GrowthTimeframeId,
} from "@/data/growth";

export type GrowthAccountType = "creator" | "business";

export type GrowthPlan = {
  id: string;
  title: string;
  summary: string;
  strategy: string;
  components: string[];
  estimatedTimeline: string | null;
  price: number | null;
  currency: string;
  notes: string | null;
  status: GrowthPlanStatus;
  sharedAt: string | null;
  respondedAt: string | null;
  customerNote: string | null;
};

export type GrowthProgressSnapshot = {
  id: string;
  audience: number;
  note: string | null;
  recordedAt: string;
};

export type GrowthRequest = {
  id: string;
  userId: string | null;
  accountType: GrowthAccountType;
  platform: GrowthPlatformId;
  profile: string;
  currentAudience: number;
  targetAudience: number;
  timeframe: GrowthTimeframeId;
  niche: string | null;
  companyName: string | null;
  website: string | null;
  industry: string | null;
  targetMarket: string | null;
  country: string | null;
  contactName: string;
  email: string;
  phone: string | null;
  status: GrowthRequestStatus;
  createdAt: string;
  updatedAt: string;
  latestAudience: number | null;
  latestRecordedAt: string | null;
  progressSnapshots: GrowthProgressSnapshot[];
  plan: GrowthPlan | null;
  hasPlan: boolean;
  /** The private thread opened for this goal. Null for anonymous requests. */
  ticketId: string | null;
  ticketStatus: TicketStatus | null;
  internalNotes?: string | null;
};

/**
 * Progress is only ever derived from a recorded audience reading. Without one
 * there is no percentage to show.
 */
export const getGoalProgress = (request: GrowthRequest) => {
  if (request.latestAudience === null) return null;

  const span = request.targetAudience - request.currentAudience;
  if (span <= 0) return null;

  const moved = request.latestAudience - request.currentAudience;
  return Math.min(Math.max(Math.round((moved / span) * 100), 0), 100);
};

export type CreateGrowthRequestPayload = {
  accountType?: GrowthAccountType;
  platform: GrowthPlatformId;
  profile: string;
  currentAudience: number;
  targetAudience: number;
  timeframe?: GrowthTimeframeId;
  niche?: string;
  companyName?: string;
  website?: string;
  industry?: string;
  targetMarket?: string;
  country?: string;
  contactName: string;
  email: string;
  phone?: string;
};

type SingleResponse = { success: true; message: string; data: GrowthRequest };
type ListResponse = {
  success: true;
  message: string;
  data: GrowthRequest[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

/**
 * Open to anonymous visitors. When an access token exists we pass it so the
 * request is linked to the signed-in account.
 */
export const submitGrowthRequest = (
  payload: CreateGrowthRequestPayload,
  token?: string | null
) =>
  apiRequest<SingleResponse>("/growth/requests", {
    method: "POST",
    body: payload,
    token: token ?? null,
  });

export const listMyGrowthRequests = () =>
  apiRequestWithRefresh<ListResponse>("/growth/requests?limit=50");

export const getGrowthRequest = (id: string) =>
  apiRequestWithRefresh<SingleResponse>(`/growth/requests/${id}`);

export const respondToGrowthPlan = (
  id: string,
  decision: "accept" | "request_changes",
  note?: string
) =>
  apiRequestWithRefresh<SingleResponse>(`/growth/requests/${id}/plan-response`, {
    method: "POST",
    body: { decision, ...(note ? { note } : {}) },
  });

export const adminListGrowthRequests = (params?: {
  status?: GrowthRequestStatus;
  search?: string;
}) => {
  const search = new URLSearchParams({ limit: "50" });
  if (params?.status) search.set("status", params.status);
  if (params?.search) search.set("search", params.search);

  return apiRequestWithRefresh<ListResponse>(
    `/admin/growth-requests?${search.toString()}`
  );
};

export const adminUpdateGrowthRequest = (
  id: string,
  body: { status?: GrowthRequestStatus; internalNotes?: string }
) =>
  apiRequestWithRefresh<SingleResponse>(`/admin/growth-requests/${id}`, {
    method: "PATCH",
    body,
  });

export const adminUpsertGrowthPlan = (
  id: string,
  body: {
    title: string;
    summary: string;
    strategy: string;
    components?: string[];
    estimatedTimeline?: string;
    price?: number;
    currency?: string;
    notes?: string;
    status?: GrowthPlanStatus;
  }
) =>
  apiRequestWithRefresh<SingleResponse>(`/admin/growth-requests/${id}/plan`, {
    method: "PUT",
    body,
  });

export const adminAddGrowthProgress = (
  id: string,
  body: { audience: number; note?: string }
) =>
  apiRequestWithRefresh<SingleResponse>(`/admin/growth-requests/${id}/progress`, {
    method: "POST",
    body,
  });
