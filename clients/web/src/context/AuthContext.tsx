import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { setOnUnauthenticated } from '../api/client';
import { authService } from '../api/services/auth.service';
import type { UserInfo, LoginRequest } from '../api/schemas/auth.schemas';

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { user } = await authService.login(credentials);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Wire axios interceptor: redirect to login on 401 + failed refresh
  setOnUnauthenticated(() => setUser(null));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
