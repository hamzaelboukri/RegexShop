'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  
  // Computed values
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

const TAX_RATE = 0.2; // 20% TVA
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

const calculateCartValues = (items: CartItem[], couponDiscount: number) => {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = couponDiscount;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const total = subtotal - discount + shipping + tax;

  return { itemCount, subtotal, discount, shipping, tax, total };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,

      addItem: (product: Product, quantity = 1) => {
        const { items, couponDiscount } = get();
        const existingItem = items.find((item) => item.productId === product.id);

        let newItems: CartItem[];

        if (existingItem) {
          // Update quantity if item exists
          newItems = items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock ?? 999) }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart-${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity: Math.min(quantity, product.stock ?? 999),
            price: product.price,
          };
          newItems = [...items, newItem];
        }

        const calculated = calculateCartValues(newItems, couponDiscount);
        set({ items: newItems, ...calculated });
      },

      removeItem: (productId: string) => {
        const { items, couponDiscount } = get();
        const newItems = items.filter((item) => item.productId !== productId);
        const calculated = calculateCartValues(newItems, couponDiscount);
        set({ items: newItems, ...calculated });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { items, couponDiscount } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const newItems = items.filter((item) => item.productId !== productId);
          const calculated = calculateCartValues(newItems, couponDiscount);
          set({ items: newItems, ...calculated });
          return;
        }

        const newItems = items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, item.product.stock ?? 999) }
            : item
        );

        const calculated = calculateCartValues(newItems, couponDiscount);
        set({ items: newItems, ...calculated });
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          couponDiscount: 0,
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        });
      },

      applyCoupon: (code: string, discount: number) => {
        const { items } = get();
        const calculated = calculateCartValues(items, discount);
        set({ couponCode: code, couponDiscount: discount, ...calculated });
      },

      removeCoupon: () => {
        const { items } = get();
        const calculated = calculateCartValues(items, 0);
        set({ couponCode: null, couponDiscount: 0, ...calculated });
      },
    }),
    {
      name: 'youshop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const calculated = calculateCartValues(state.items, state.couponDiscount);
          Object.assign(state, calculated);
        }
      },
    }
  )
);

// Custom hook for cart actions
export const useCart = () => {
  const store = useCartStore();
  
  return {
    items: store.items,
    itemCount: store.itemCount,
    subtotal: store.subtotal,
    discount: store.discount,
    shipping: store.shipping,
    tax: store.tax,
    total: store.total,
    couponCode: store.couponCode,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
    isEmpty: store.items.length === 0,
    isInCart: (productId: string) => store.items.some((item) => item.productId === productId),
    getItemQuantity: (productId: string) => 
      store.items.find((item) => item.productId === productId)?.quantity || 0,
  };
};
