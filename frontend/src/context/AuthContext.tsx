import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiGet, clearAuthToken, getAuthToken, saveAuthToken } from "../api/client";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await apiGet<UserProfile>("/auth/me");
      setUser(data);
    } catch (err) {
      const status = (err as any)?.status;
      if (status === 401) {
        clearAuthToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const loginWithToken = useCallback(async (token: string) => {
    saveAuthToken(token);
    setLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginWithToken,
      logout,
      refreshProfile: fetchProfile
    }),
    [user, loading, loginWithToken, logout, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
