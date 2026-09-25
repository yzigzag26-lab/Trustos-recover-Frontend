import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type User } from '../services/authService';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signup: (name: string, email: string, password: string, termsAccepted: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const result = await authService.session();
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, refresh,
    signup: authService.signup,
    login: async (email, password) => { const result = await authService.login(email, password); setUser(result.user); },
    requestPasswordReset: authService.requestPasswordReset,
    resetPassword: async (password) => { await authService.resetPassword(password); setUser(null); },
    logout: async () => { await authService.logout(); setUser(null); },
  }), [user, loading, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
