import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiRequest,
  apiRequestWithRefresh,
  AuthTokens,
  AuthUser,
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  accessToken: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
};

type MeResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialSession = getStoredSession();
  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(
    initialSession?.accessToken ?? null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const session = getStoredSession();

      if (!session?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequestWithRefresh<MeResponse>("/auth/me", {
          token: session.accessToken,
        });

        const nextSession = {
          ...(getStoredSession() ?? session),
          user: response.data.user,
        };

        setStoredSession(nextSession);
        setUser(response.data.user);
        setAccessToken(nextSession.accessToken);
      } catch {
        clearStoredSession();
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();
  }, []);

  const persistSession = (response: AuthResponse) => {
    const nextSession = {
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      refreshToken: response.data.tokens.refreshToken,
    };

    setStoredSession(nextSession);
    setUser(nextSession.user);
    setAccessToken(nextSession.accessToken);

    return nextSession.user;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login: async (email: string, password: string) => {
        const response = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
        });

        return persistSession(response);
      },
      register: async (name: string, email: string, password: string) => {
        const response = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          body: {
            fullName: name,
            email,
            password,
          },
        });

        return persistSession(response);
      },
      logout: async () => {
        try {
          if (accessToken) {
            await apiRequestWithRefresh("/auth/logout", {
              method: "POST",
              token: accessToken,
            });
          }
        } finally {
          clearStoredSession();
          setUser(null);
          setAccessToken(null);
        }
      },
      refreshProfile: async () => {
        const response = await apiRequestWithRefresh<MeResponse>("/auth/me", {
          token: accessToken,
        });

        const session = getStoredSession();
        if (session) {
          setStoredSession({
            ...session,
            user: response.data.user,
          });
        }

        setUser(response.data.user);
      },
    }),
    [accessToken, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
