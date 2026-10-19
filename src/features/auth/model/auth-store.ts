'use client';

import { create } from 'zustand';
import type { SessionUser } from '../types';
import { authService } from '../services/auth-service';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  login: (user: SessionUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: (user) => set({ user }),
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null });
    }
  },
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const data = await authService.getMe();
      if (data.authenticated && data.user) {
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  return {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
    isAdmin: user?.role === 'ADMIN',
    isConsultant: user?.role === 'CONSULTANT' || user?.role === 'ADMIN',
  };
}
