import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'smartshuttle_user';

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'student@smartshuttle.com': {
    password: 'student123',
    user: {
      id: 'stu-001',
      name: 'Alex Johnson',
      email: 'student@smartshuttle.com',
      role: 'student' as UserRole,
    },
  },
  'admin@smartshuttle.com': {
    password: 'admin123',
    user: {
      id: 'adm-001',
      name: 'Sarah Mitchell',
      email: 'admin@smartshuttle.com',
      role: 'admin' as UserRole,
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const entry = DEMO_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
    setUser(entry.user);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
