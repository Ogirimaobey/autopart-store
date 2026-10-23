import { create } from 'zustand';
import { User, SupplierProfile } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  supplierProfile: SupplierProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<any>;
  registerBuyer: (data: any) => Promise<any>;
  registerSupplier: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  supplierProfile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.auth.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('autopart_access_token', data.tokens.accessToken);
        localStorage.setItem('autopart_refresh_token', data.tokens.refreshToken);
      }
      set({
        user: data.user,
        supplierProfile: data.supplierProfile || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  registerBuyer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await api.auth.registerBuyer(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('autopart_access_token', res.tokens.accessToken);
        localStorage.setItem('autopart_refresh_token', res.tokens.refreshToken);
      }
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return res;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  registerSupplier: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await api.auth.registerSupplier(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('autopart_access_token', res.tokens.accessToken);
        localStorage.setItem('autopart_refresh_token', res.tokens.refreshToken);
      }
      set({
        user: res.user,
        supplierProfile: res.supplierProfile,
        isAuthenticated: true,
        isLoading: false,
      });
      return res;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (_) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autopart_access_token');
      localStorage.removeItem('autopart_refresh_token');
    }
    set({
      user: null,
      supplierProfile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchMe: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('autopart_access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      set({ isLoading: true });
      const user: any = await api.auth.getMe();
      let supplierProfile: any = null;
      if (user.role === 'supplier') {
        try {
          supplierProfile = await api.suppliers.getMyProfile();
        } catch (_) {}
      }
      set({
        user,
        supplierProfile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      localStorage.removeItem('autopart_access_token');
      localStorage.removeItem('autopart_refresh_token');
      set({ user: null, supplierProfile: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
