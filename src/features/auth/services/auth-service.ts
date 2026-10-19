import { apiFetch } from '@/shared/api';
import type { SessionUser } from '../types';

export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: SessionUser;
}

export interface MeResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        login: payload.login.trim(),
        password: payload.password,
      }),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<MeResponse> {
    return apiFetch<MeResponse>('/api/auth/me');
  },
};
