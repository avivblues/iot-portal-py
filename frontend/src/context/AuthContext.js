import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, clearAuthToken, getAuthToken, saveAuthToken } from "../api/client";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchProfile = useCallback(async () => {
        const token = getAuthToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await apiGet("/auth/me");
            setUser(data);
        }
        catch (err) {
            const status = err?.status;
            if (status === 401) {
                clearAuthToken();
                setUser(null);
            }
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    const loginWithToken = useCallback(async (token) => {
        saveAuthToken(token);
        setLoading(true);
        await fetchProfile();
    }, [fetchProfile]);
    const logout = useCallback(() => {
        clearAuthToken();
        setUser(null);
    }, []);
    const value = useMemo(() => ({
        user,
        loading,
        loginWithToken,
        logout,
        refreshProfile: fetchProfile
    }), [user, loading, loginWithToken, logout, fetchProfile]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};
