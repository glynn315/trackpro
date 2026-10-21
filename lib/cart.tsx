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
import { NO_CART_CHOICES, type CatalogProduct } from "@/lib/products";
import {
  cleanOptions,
  EMPTY_STORE_OPTIONS,
  lineKey,
  priceSelection,
  type CartOptions,
  type PricedSelection,
  type StoreOptions,
} from "@/lib/cart-options";

const STORAGE_KEY = "trackpro:cart";

export type CartItem = {
  /** Product + picked options — the same product with different picks is its own line. */
  key: string;
  // Product slug/id, widened to string so live (admin-managed) inventory can
  // flow through the cart, not just the statically-typed catalog ids.
  productId: string;
  qty: number;
  options?: CartOptions;
};

export type CartLine = CartItem & {
  product: CatalogProduct;
  picked: PricedSelection;
  /** Hardware + add-ons for the line (one-time). */
  lineTotal: number;
  /** First plan period (plan + bandwidth) for the line, paid at checkout. */
  planTotal: number;
  /** Legacy built-in monthly fee — only for products ordered without a chosen plan. */
  subscriptionTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  /** Hardware + add-ons. */
  subtotal: number;
  /** First period of every chosen plan (+ bandwidth). */
  planTotal: number;
  /** Due at checkout: subtotal + planTotal. */
  total: number;
  subscriptionTotal: number;
  /** Add-ons and plans the options popup offers. */
  store: StoreOptions;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, qty?: number, options?: CartOptions) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
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
  ...NO_CART_CHOICES,
}));

export function CartProvider({
  children,
  catalog,
  store = EMPTY_STORE_OPTIONS,
}: {
  children: ReactNode;
  /**
   * Live catalog from the server. Required for admin-created products to be
   * addable to the cart — without it the cart can only resolve the nine
   * hardcoded products in `lib/site.ts`.
   */
  catalog?: CatalogProduct[];
  store?: StoreOptions;
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
          setItems(
            parsed
              .filter((it) => typeof it?.productId === "string" && it.qty > 0)
              // Carts saved before options existed have no key.
              .map((it) => ({ ...it, key: it.key ?? lineKey(it.productId, it.options) }))
          );
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

  const addItem = useCallback((productId: string, qty: number = 1, picked?: CartOptions) => {
    const options = picked ? cleanOptions(picked) : undefined;
    const key = lineKey(productId, options);
    setItems((prev) => {
      const existing = prev.find((it) => it.key === key);
      if (existing) {
        return prev.map((it) => (it.key === key ? { ...it, qty: it.qty + qty } : it));
      }
      return [...prev, { key, productId, qty, ...(options ? { options } : {}) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.key !== key);
      return prev.map((it) => (it.key === key ? { ...it, qty } : it));
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
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
          const picked = priceSelection(product, it.options ?? {}, store);
          return {
            ...it,
            product,
            picked,
            lineTotal: picked.unitPrice * it.qty,
            planTotal: picked.planUnit * it.qty,
            subscriptionTotal: picked.plan ? 0 : product.subscription * it.qty,
          };
        })
        .filter((l): l is CartLine => l !== null),
    [items, productById, store]
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);
  const planTotal = useMemo(() => lines.reduce((sum, l) => sum + l.planTotal, 0), [lines]);
  const subscriptionTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.subscriptionTotal, 0),
    [lines]
  );

  const value: CartContextValue = {
    items,
    lines,
    itemCount,
    subtotal,
    planTotal,
    total: subtotal + planTotal,
    subscriptionTotal,
    store,
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
