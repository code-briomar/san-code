// "use client";

// import { useTheme } from "next-themes";
// import { useEffect, useState } from "react";
// import { Button } from "../ui/button";
// import { MoonIcon, SunDim } from "lucide-react";

// export default function ThemeSWitcher() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true); // Prevent hydration mismatch
//   }, []);

//   if (!mounted) return null;

//   return (
//     <div className="fixed top-4 right-4 z-50">
//       <Button
//         onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//         className="my-16 md:my-2 text-lg font-medium rounded-md border bg-white text-black dark:bg-zinc-800/30 dark:from-inherit dark:text-white dark:border-gray-800"
//       >
//         {theme === "dark" ? <SunDim className="w-6 h-6 text-yellow-500"/> : <MoonIcon className="w-6 h-6"/>}
//       </Button>
//     </div>
//   );
// }

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // Prevent hydration mismatch
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 text-slate-850 dark:text-slate-100 shadow-lg hover:scale-105 active:scale-95 transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
          <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer text-xs font-medium">
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer text-xs font-medium">
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer text-xs font-medium">
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
