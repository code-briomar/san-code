// components/custom/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import React, { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch: don’t render until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>; // Optional fallback
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
