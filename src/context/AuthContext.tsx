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
  clearAccessToken,
  setAccessToken,
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await apiRequest<{
          success: true;
          message: string;
          data: {
            user: AuthUser;
            tokens: AuthTokens;
          };
        }>("/auth/refresh", {
          method: "POST",
        });

        setUser(response.data.user);
        setAccessToken(response.data.tokens.accessToken);
        setAccessTokenState(response.data.tokens.accessToken);
      } catch {
        clearAccessToken();
        setUser(null);
        setAccessTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();
  }, []);

  const persistSession = (response: AuthResponse) => {
    setAccessToken(response.data.tokens.accessToken);
    setUser(response.data.user);
    setAccessTokenState(response.data.tokens.accessToken);

    return response.data.user;
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
          clearAccessToken();
          setUser(null);
          setAccessTokenState(null);
        }
      },
      refreshProfile: async () => {
        const response = await apiRequestWithRefresh<MeResponse>("/auth/me", {
          token: accessToken,
        });

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
