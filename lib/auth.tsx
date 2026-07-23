"use client";

/**
 * Customer auth backed by the Laravel API (Sanctum token).
 * The token is kept in localStorage and sent as a Bearer token on checkout.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const TOKEN_KEY = "trackpro:ctoken";
const USER_KEY = "trackpro:cuser";

export type AuthUser = {
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
};

type ApiCustomer = {
  name: string;
  email: string;
  phone: string | null;
  email_verified: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  signUp: (input: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  resendVerification: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(c: ApiCustomer): AuthUser {
  return { name: c.name, email: c.email, phone: c.phone ?? undefined, emailVerified: c.email_verified };
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json();
    if (j?.message) return j.message as string;
    if (j?.errors) return String(Object.values(j.errors).flat()[0] ?? fallback);
  } catch {
    /* ignore */
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const persist = useCallback((nextToken: string | null, nextUser: AuthUser | null) => {
    try {
      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
      else localStorage.removeItem(TOKEN_KEY);
      if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore quota/availability */
    }
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const refreshWith = useCallback(
    async (tok: string) => {
      const res = await fetch(`${API_BASE}/api/customer/me`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
        cache: "no-store",
      });
      if (res.status === 401) {
        persist(null, null); // stale token
        return;
      }
      if (res.ok) {
        const { customer } = await res.json();
        persist(tok, mapUser(customer));
      }
    },
    [persist]
  );

  // Hydrate from localStorage, then refresh from the API (picks up verification).
  useEffect(() => {
    let tok: string | null = null;
    try {
      tok = localStorage.getItem(TOKEN_KEY);
      const rawUser = localStorage.getItem(USER_KEY);
      if (tok && rawUser) {
        setToken(tok);
        setUser(JSON.parse(rawUser) as AuthUser);
      }
    } catch {
      /* ignore */
    }
    (async () => {
      if (tok) await refreshWith(tok).catch(() => {});
      setHydrated(true);
    })();
  }, [refreshWith]);

  const signUp: AuthContextValue["signUp"] = useCallback(
    async ({ name, email, phone, password }) => {
      const res = await fetch(`${API_BASE}/api/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, phone: phone || null, password }),
      });
      if (!res.ok) throw new Error(await parseError(res, "Could not create your account."));
      const { customer, token: tok } = await res.json();
      persist(tok, mapUser(customer));
    },
    [persist]
  );

  const signIn: AuthContextValue["signIn"] = useCallback(
    async ({ email, password }) => {
      const res = await fetch(`${API_BASE}/api/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await parseError(res, "Incorrect email or password."));
      const { customer, token: tok } = await res.json();
      persist(tok, mapUser(customer));
    },
    [persist]
  );

  const signOut = useCallback(() => {
    const tok = token;
    if (tok) {
      void fetch(`${API_BASE}/api/customer/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${tok}` },
      }).catch(() => {});
    }
    persist(null, null);
  }, [token, persist]);

  const resendVerification = useCallback(async () => {
    if (!token) return;
    await fetch(`${API_BASE}/api/customer/email/resend`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
  }, [token]);

  const refresh = useCallback(async () => {
    if (token) await refreshWith(token);
  }, [token, refreshWith]);

  return (
    <AuthContext.Provider
      value={{ user, token, hydrated, signUp, signIn, signOut, resendVerification, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
