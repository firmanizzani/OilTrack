import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('olitrack_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('olitrack_token'),
  isAuthenticated: !!localStorage.getItem('olitrack_token'),

  setAuth: (user, token) => {
    localStorage.setItem('olitrack_token', token);
    localStorage.setItem('olitrack_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('olitrack_token');
    localStorage.removeItem('olitrack_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
