import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authService,
  type SessionResult,
  type User,
} from '../services/authService';
import { supabase } from '../lib/supabase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    termsAccepted: boolean
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const result: SessionResult = await authService.session();
      setUser(result.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const result = await authService.session();

        if (mounted) {
          setUser(result.user);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const metadataName = session.user.user_metadata?.name;

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name:
            typeof metadataName === 'string' && metadataName.trim()
              ? metadataName
              : session.user.email ?? 'Trustos User',
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (
    name: string,
    email: string,
    password: string,
    termsAccepted: boolean
  ) => {
    await authService.signup(
      name,
      email,
      password,
      termsAccepted
    );
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
  };

  const requestPasswordReset = async (email: string) => {
    await authService.requestPasswordReset(email);
  };

  const resetPassword = async (password: string) => {
    await authService.resetPassword(password);
    setUser(null);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      signup,
      login,
      requestPasswordReset,
      resetPassword,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}