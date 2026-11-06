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
import { api, clearSession, getStoredUser, saveSession } from "@/lib/api";
import type { AuthUser } from "@/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout }),
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
