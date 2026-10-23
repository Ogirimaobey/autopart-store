import { create } from 'zustand';
import { CartResponse } from '../types';
import { api } from '../lib/api';

interface CartState {
  cart: CartResponse | null;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  totalItems: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('autopart_access_token');
    if (!token) {
      set({ cart: null, totalItems: 0 });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data: any = await api.cart.get();
      set({
        cart: data,
        totalItems: data.totalItems || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.cart.addItem(productId, quantity);
      set({
        cart: data,
        totalItems: data.totalItems || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.cart.updateItem(productId, quantity);
      set({
        cart: data,
        totalItems: data.totalItems || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.cart.removeItem(productId);
      set({
        cart: data,
        totalItems: data.totalItems || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.cart.clear();
      set({
        cart: null,
        totalItems: 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
