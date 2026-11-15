import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loginWithSupabase } from '../lib/vmsSupabase';
import type { User } from '../types/vms';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const SESSION_KEY = 'vms-auth-session';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredSession = (): User | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredSession());

  const login = useCallback(async (username: string, password: string) => {
    const match = await loginWithSupabase(username, password);

    if (!match) {
      return null;
    }

    setUser(match);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(match));
    return match;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
    }),
    [login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
