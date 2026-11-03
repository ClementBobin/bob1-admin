"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearSession,
  getStoredUser,
  saveSession,
  USE_MOCK,
  type AuthUser,
} from "@/lib/api";

/** The account shown when NEXT_PUBLIC_USE_MOCK=true. */
export const MOCK_USER: AuthUser = {
  id: "mock-admin",
  email: "admin@bob1.local",
  firstName: "Camille",
  lastName: "Martin",
  roles: ["Parent", "Staff", "Admin"],
  familyId: null,
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(USE_MOCK ? MOCK_USER : null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    const stored = getStoredUser();
    if (!stored) {
      setLoading(false);
      return;
    }

    // Show the cached profile immediately, then refresh it (and the token) from the API.
    setUser(stored);
    let cancelled = false;
    api
      .me()
      .then((fresh) => {
        if (!cancelled) setUser(fresh);
      })
      .catch(() => {
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email.trim(), password);
    saveSession(response);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(USE_MOCK ? MOCK_USER : null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isMock: USE_MOCK, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function displayName(user: AuthUser | null): string {
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`.trim();
}

export function primaryRole(user: AuthUser | null): string {
  if (!user) return "";
  if (user.roles.includes("Admin")) return "Administrateur";
  if (user.roles.includes("Staff")) return "Staff";
  if (user.roles.includes("Parent")) return "Parent";
  return user.roles[0] ?? "Membre";
}
