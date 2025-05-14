"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { MoonIcon, SunDim } from "lucide-react";

export default function ThemeSWitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Prevent hydration mismatch
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="my-16 md:my-2 text-lg font-medium rounded-md border bg-white text-black dark:bg-zinc-800/30 dark:from-inherit dark:text-white dark:border-gray-800"
      >
        {theme === "dark" ? <SunDim className="w-6 h-6 text-yellow-500"/> : <MoonIcon className="w-6 h-6"/>}
      </Button>
    </div>
  );
}
