import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken, removeToken, setToken } from "@/lib/api";
import { getCurrentUser } from "@/services/auth.service";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        if (location.pathname !== "/login" && !location.pathname.startsWith("/doctor")) {
          navigate("/login");
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setTokenState(storedToken);
      } catch {
        removeToken();
        setUser(null);
        setTokenState(null);
        if (location.pathname !== "/login" && !location.pathname.startsWith("/doctor")) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    const isDoctorPortal = location.pathname.startsWith("/doctor");
    removeToken();
    setTokenState(null);
    setUser(null);
    navigate(isDoctorPortal ? "/doctor" : "/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
