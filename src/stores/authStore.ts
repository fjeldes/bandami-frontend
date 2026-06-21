import { create } from "zustand";

const API_BASE = (() => { const u = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"; return u.endsWith("/api/v1") ? u : u.replace(/\/+$/, "") + "/api/v1"; })();

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  role?: string;
  referral_code?: string;
  referral_discounts?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setAuthCookie(token: string) {
  document.cookie = `auth_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = "auth_token=; path=/; max-age=0";
}

export function storeTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  setAuthCookie(access);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  removeAuthCookie();
}

async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
}

let refreshPromise: Promise<string | null> | null = null;
let lastRefreshAttempt = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setTokens: (access: string, refresh: string) => {
    storeTokens(access, refresh);
    set({ accessToken: access });
  },

  clearAuth: () => {
    clearTokens();
    set({ user: null, accessToken: null, isLoading: false });
  },

  initialize: async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      set({ isLoading: false, user: null });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        if (!get().user) clearTokens();
        set({ isLoading: false, user: get().user || null });
        return;
      }

      const data = await res.json();
      if (!get().user) {
        storeTokens(data.access_token, data.refresh_token);
        set({ user: data.user, accessToken: data.access_token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      if (!get().user) clearTokens();
      set({ isLoading: false, user: get().user || null });
    }
  },

  refreshSession: async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    const now = Date.now();
    if (now - lastRefreshAttempt < 2000 && refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      lastRefreshAttempt = now;
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });

        if (!res.ok) {
          if (res.status === 401) get().clearAuth();
          return null;
        }

        const data = await res.json();
        storeTokens(data.access_token, data.refresh_token);
        set({ accessToken: data.access_token, user: data.user });
        return data.access_token;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  login: async (email: string, password: string) => {
    const res = await authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    storeTokens(data.access_token, data.refresh_token);
    set({ user: data.user, accessToken: data.access_token });
  },

  register: async (name: string, email: string, password: string, referralCode?: string) => {
    const body: Record<string, string> = { email, password, full_name: name };
    if (referralCode) body.referral_code = referralCode;
    const res = await authFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed");
    }
  },

  logout: async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await authFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refresh }),
        });
      } catch { /* ignore */ }
    }
    get().clearAuth();
  },

  verifyEmail: async (token: string) => {
    const res = await authFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Verification failed");
    }

    storeTokens(data.access_token, data.refresh_token);
    set({ user: data.user, accessToken: data.access_token });
  },

  resendVerification: async (email: string) => {
    const res = await authFetch("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to resend");
    }
  },
}));
