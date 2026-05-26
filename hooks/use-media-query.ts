"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 * Returns `false` during SSR and on the first client render (hydration-safe).
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);

    // Set initial value
    setMatches(mql.matches);

    function onChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/* ──────────────────────────────────────────────
   Pre-built breakpoint hooks (match Tailwind defaults)
   ────────────────────────────────────────────── */

/** ≥ 640px */
export function useIsSm() {
  return useMediaQuery("(min-width: 640px)");
}

/** ≥ 768px */
export function useIsMd() {
  return useMediaQuery("(min-width: 768px)");
}

/** ≥ 1024px */
export function useIsLg() {
  return useMediaQuery("(min-width: 1024px)");
}

/** ≥ 1280px */
export function useIsXl() {
  return useMediaQuery("(min-width: 1280px)");
}
