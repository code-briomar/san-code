"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OutbreakAlert({ outbreaks }) {
  if (!outbreaks?.length) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Potential outbreak detected:
        </span>
        {outbreaks.map((o) => (
          <Badge
            key={o.ailment}
            className="border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-200"
          >
            {o.ailment} ({o.count})
          </Badge>
        ))}
      </div>
    </div>
  );
}
