"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Infinite-scroll list state. Renders `initial` rows, then calls `fetchPage`
 * (a server action) for the next page when the sentinel scrolls into view.
 */
export function useLazyList<T>(
  initial: T[],
  initialHasMore: boolean,
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>
) {
  const [rows, setRows] = useState<T[]>(initial);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const next = page + 1;
    try {
      const res = await fetchPage(next);
      setRows((r) => [...r, ...res.items]);
      setHasMore(res.hasMore);
      setPage(next);
    } finally {
      setLoading(false);
    }
  }, [page, fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) load();
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, load]);

  return { rows, setRows, hasMore, loading, sentinel };
}
