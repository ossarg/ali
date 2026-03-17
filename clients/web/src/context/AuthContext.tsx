import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { setOnUnauthenticated, setAccessToken } from "../api/client";
import { authService } from "../api/services/auth.service";
import type { UserInfo, LoginRequest } from "../api/schemas/auth.schemas";

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Restore token on mount so axios interceptor lo tiene disponible
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) setAccessToken(token);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { token, user: loggedUser } = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  setOnUnauthenticated(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  });

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
