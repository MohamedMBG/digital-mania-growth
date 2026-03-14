export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export type ApiError = {
  statusCode?: number;
  message?: string | string[];
  timestamp?: string;
  path?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "customer" | "admin" | "support";
  provider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

type StoredSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

const SESSION_KEY = "nexora-session";

export const getStoredSession = (): StoredSession | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const setStoredSession = (session: StoredSession) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};

export const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorBody: ApiError | undefined;

    try {
      errorBody = (await response.json()) as ApiError;
    } catch {
      errorBody = { message: response.statusText, statusCode: response.status };
    }

    throw errorBody;
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function apiRequestWithRefresh<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const session = getStoredSession();
  const token = options.token ?? session?.accessToken ?? null;

  try {
    return await apiRequest<TResponse>(path, { ...options, token });
  } catch (error) {
    const statusCode =
      typeof error === "object" && error && "statusCode" in error
        ? Number((error as ApiError).statusCode)
        : undefined;

    if (statusCode !== 401 || !session?.refreshToken) {
      throw error;
    }

    const refreshed = await apiRequest<{
      success: true;
      data: { user: AuthUser; tokens: AuthTokens };
    }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
    });

    const nextSession = {
      user: refreshed.data.user,
      accessToken: refreshed.data.tokens.accessToken,
      refreshToken: refreshed.data.tokens.refreshToken,
    };

    setStoredSession(nextSession);

    return apiRequest<TResponse>(path, {
      ...options,
      token: nextSession.accessToken,
    });
  }
}
