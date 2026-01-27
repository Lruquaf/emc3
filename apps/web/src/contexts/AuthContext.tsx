import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { authApi, UserResponse } from '../api/auth.api';
import type { LoginInput, RegisterInput } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

// ═══════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextValue | null>(null);

// ═══════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ─────────────────────────────────────────────────────────
  // Initialize - Check for existing session
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getMe();
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
  }, []);

  // ─────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────

  const login = useCallback(async (data: LoginInput) => {
    const response = await authApi.login(data);
    setState({
      user: response.user,
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  // ─────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────

  const register = useCallback(async (data: RegisterInput) => {
    await authApi.register(data);
    // Don't auto-login after register - user needs to verify email
  }, []);

  // ─────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // ─────────────────────────────────────────────────────────
  // Refresh User
  // ─────────────────────────────────────────────────────────

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.getMe();
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // ─────────────────────────────────────────────────────────
  // Role Check
  // ─────────────────────────────────────────────────────────

  const hasRole = useCallback(
    (role: string) => {
      return state.user?.roles?.includes(role) ?? false;
    },
    [state.user]
  );

  // ─────────────────────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

