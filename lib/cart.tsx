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
import { products as staticProducts } from "@/lib/site";
import type { CatalogProduct } from "@/lib/products";

const STORAGE_KEY = "trackpro:cart";

export type CartItem = {
  // Product slug/id, widened to string so live (admin-managed) inventory can
  // flow through the cart, not just the statically-typed catalog ids.
  productId: string;
  qty: number;
};

export type CartLine = CartItem & {
  product: CatalogProduct;
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

/**
 * Static catalog shaped like a CatalogProduct, used only when no live catalog
 * was passed in (e.g. the API was down when the page was rendered).
 */
const STATIC_FALLBACK: CatalogProduct[] = staticProducts.map((p) => ({
  ...p,
  media: [],
  featured: "featured" in p ? Boolean(p.featured) : false,
  stock: null,
  inStock: true,
}));

export function CartProvider({
  children,
  catalog,
}: {
  children: ReactNode;
  /**
   * Live catalog from the server. Required for admin-created products to be
   * addable to the cart — without it the cart can only resolve the nine
   * hardcoded products in `lib/site.ts`.
   */
  catalog?: CatalogProduct[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const productById = useCallback(
    (id: string) => {
      const source = catalog && catalog.length > 0 ? catalog : STATIC_FALLBACK;
      return source.find((p) => p.id === id);
    },
    [catalog]
  );

  // Hydrate from localStorage on mount.
  // Stored ids are kept as-is rather than filtered against the catalog — an id
  // we can't resolve right now is simply skipped by `lines` below, so a product
  // isn't silently dropped from someone's cart just because the catalog was
  // momentarily unavailable. Checkout re-validates against live stock.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((it) => typeof it?.productId === "string" && it.qty > 0));
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
    [items, productById]
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
