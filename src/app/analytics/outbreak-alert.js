"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OutbreakAlert({ outbreaks }) {
  if (!outbreaks?.length) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-350 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Potential outbreak detected:
        </span>
        {outbreaks.map((o) => (
          <Badge
            key={o.ailment}
            className="border-slate-400 bg-slate-100 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 font-semibold"
          >
            {o.ailment} ({o.count})
          </Badge>
        ))}
      </div>
    </div>
  );
}
