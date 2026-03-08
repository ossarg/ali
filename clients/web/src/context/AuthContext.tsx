import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { setOnUnauthenticated } from "../api/client";
import { authService } from "../api/services/auth.service";
import type { UserInfo, LoginRequest } from "../api/schemas/auth.schemas";

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>({
    id: "1",
    email: "admin@libraseguros.com.ar",
    first_name: "Admin",
    last_name: "User",
    role: "admin",
    capabilities: [],
  });

  const login = useCallback(async (credentials: LoginRequest) => {
    // Mock login since backend is unavailable
    setUser({
      id: "1",
      email: credentials.email,
      first_name: "Admin",
      last_name: "User",
      role: "admin",
      capabilities: [],
    });
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  // Wire axios interceptor: redirect to login on 401 + failed refresh
  setOnUnauthenticated(() => setUser(null));

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
