import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService as authApi, fetchMe } from '../services/authService';
import type { ReactNode } from 'react';

// Auth user type - matches what backend returns
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  role?: string;
  provider?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (u: AuthUser | null) => void;
  refreshUser: (options?: { retry?: number; delayMs?: number }) => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: { name: string; email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const latestRefreshId = useRef(0);

  const isAuthenticated = !!user;

  const refreshUser = async (options?: { retry?: number; delayMs?: number }) => {
    const { retry = 0, delayMs = 0 } = options || {};
    const myId = ++latestRefreshId.current;

    const attempt = async () => {
      try {
        if (myId !== latestRefreshId.current) return false; // Stale request
        const data = await fetchMe();
        
        if (data?.authenticated && data.user) {
          if (myId === latestRefreshId.current) {
            setUser(data.user);
          }
          return true; // Authenticated
        } else {
          // Only set to null if we got a clear "not authenticated" response
          if (data && data.authenticated === false) {
            setUser(null);
          }
          return false; // Not authenticated
        }
      } catch (error) {
        if (myId !== latestRefreshId.current) return false;
        // Don't clear user on network errors - keep existing state
        return false;
      }
    };

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    
    const success = await attempt();
    if (success) return; // Already authenticated, no need to retry

    // Retry logic if still not authenticated
    for (let i = 0; i < retry; i++) {
      await new Promise((r) => setTimeout(r, 100 * (i + 1)));
      const retrySuccess = await attempt();
      if (retrySuccess) break;
    }
  };

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const data = await fetchMe();
        if (!mounted) return; // Component unmounted
        if (data?.authenticated && data.user) {
          setUser(data.user);
        }
        // Don't set user to null here - let user remain unauthenticated by default
      } catch {
        // Don't clear user on network errors during init
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
  const res = await authApi.login(email, password);
    if (res?.success) await refreshUser();
    return res;
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
  const res = await authApi.register(payload);
    // For email/password signup you may not auto-login; only refresh if API sets cookie
    if (res?.success) await refreshUser();
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        setUser,
        refreshUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
