"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { products, type Product } from "@/lib/site";

const STORAGE_KEY = "trackpro:cart";

export type CartItem = {
  // Product slug/id, widened to string so live (admin-managed) inventory can
  // flow through the cart, not just the statically-typed catalog ids.
  productId: string;
  qty: number;
};

export type CartLine = CartItem & {
  product: Product;
  lineTotal: number;
  subscriptionTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  subscriptionTotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const productById = (id: string) => products.find((p) => p.id === id);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((it) => productById(it.productId)));
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration so we don't overwrite stored state with [])
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((productId: string, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === productId);
      if (existing) {
        return prev.map((it) =>
          it.productId === productId ? { ...it, qty: it.qty + qty } : it
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.productId !== productId);
      return prev.map((it) => (it.productId === productId ? { ...it, qty } : it));
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Derived state
  const lines: CartLine[] = useMemo(
    () =>
      items
        .map((it) => {
          const product = productById(it.productId);
          if (!product) return null;
          return {
            ...it,
            product,
            lineTotal: product.price * it.qty,
            subscriptionTotal: product.subscription * it.qty,
          };
        })
        .filter((l): l is CartLine => l !== null),
    [items]
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);
  const subscriptionTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.subscriptionTotal, 0),
    [lines]
  );

  const value: CartContextValue = {
    items,
    lines,
    itemCount,
    subtotal,
    subscriptionTotal,
    drawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    setQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
