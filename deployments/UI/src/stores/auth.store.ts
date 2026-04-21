import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  timezone: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, timezone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<AuthUser>) => void;
  setAccessToken: (token: string, user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAccessToken(token, user) {
        setAccessToken(token);
        set({ accessToken: token, user, isAuthenticated: true });
      },

      async login(email, password) {
        set({ isLoading: true });
        try {
          const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
            '/api/auth/login',
            { email, password },
          );
          setAccessToken(data.accessToken);
          set({
            accessToken: data.accessToken,
            user: data.user,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      async register(name, email, password, timezone = 'UTC') {
        set({ isLoading: true });
        try {
          const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
            '/api/auth/register',
            { name, email, password, timezone },
          );
          setAccessToken(data.accessToken);
          set({
            accessToken: data.accessToken,
            user: data.user,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      async logout() {
        try {
          await api.post('/api/auth/logout');
        } catch {
          // ignore errors on logout
        } finally {
          setAccessToken(null);
          set({ accessToken: null, user: null, isAuthenticated: false });
        }
      },

      async refreshToken() {
        try {
          const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
            '/api/auth/refresh',
          );
          setAccessToken(data.accessToken);
          set({ accessToken: data.accessToken, user: data.user, isAuthenticated: true });
          return true;
        } catch {
          setAccessToken(null);
          set({ accessToken: null, user: null, isAuthenticated: false });
          return false;
        }
      },

      updateUser(updates) {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },
    }),
    {
      name: 'tps-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    },
  ),
);
