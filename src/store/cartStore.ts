import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isOrderFormOpen: boolean;
  isSuccessOpen: boolean;
  orderName: string;
  orderPhone: string;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  openDrawer: () => void;
  closeDrawer: () => void;
  openOrderForm: () => void;
  closeOrderForm: () => void;
  openSuccess: (name: string, phone: string) => void;
  closeSuccess: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      isOrderFormOpen: false,
      isSuccessOpen: false,
      orderName: '',
      orderPhone: '',
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(i => i.product.id === product.id);
        if (existing) {
          set({ items: items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
        set({ isDrawerOpen: true });
      },
      removeItem: (productId) => set({ items: get().items.filter(i => i.product.id !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
        } else {
          set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity } : i) });
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      openOrderForm: () => set({ isOrderFormOpen: true, isDrawerOpen: false }),
      closeOrderForm: () => set({ isOrderFormOpen: false }),
      openSuccess: (name, phone) => set({ isSuccessOpen: true, isOrderFormOpen: false, orderName: name, orderPhone: phone }),
      closeSuccess: () => set({ isSuccessOpen: false }),
    }),
    {
      name: 'pharmaco-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
