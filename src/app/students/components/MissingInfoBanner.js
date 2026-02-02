"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function MissingInfoBanner({ missingFields, onAddClick }) {
  return (
    <div className="mx-6 mb-2 p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-500/70" />
          <p className="text-sm text-amber-700/80 dark:text-amber-300/70">
            <span className="font-medium">Missing:</span> {missingFields.join(", ")}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-amber-600/80 dark:text-amber-400/70 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
          onClick={onAddClick}
        >
          Add now
        </Button>
      </div>
    </div>
  );
}
