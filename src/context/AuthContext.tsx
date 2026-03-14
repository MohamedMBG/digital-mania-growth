import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  name: string;
  email: string;
  provider: "email" | "google";
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => AuthUser;
  register: (name: string, email: string, password: string) => AuthUser;
  loginWithGoogle: () => AuthUser;
  logout: () => void;
};

const STORAGE_KEY = "digital-mania-auth-user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getInitialUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: (email: string) => {
        const nextUser = {
          name: email.split("@")[0] || "Creator",
          email,
          provider: "email" as const,
        };
        setUser(nextUser);
        return nextUser;
      },
      register: (name: string, email: string) => {
        const nextUser = {
          name: name.trim() || email.split("@")[0] || "Creator",
          email,
          provider: "email" as const,
        };
        setUser(nextUser);
        return nextUser;
      },
      loginWithGoogle: () => {
        const nextUser = {
          name: "Google Creator",
          email: "creator.google@example.com",
          provider: "google" as const,
        };
        setUser(nextUser);
        return nextUser;
      },
      logout: () => setUser(null),
    }),
    [user]
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
