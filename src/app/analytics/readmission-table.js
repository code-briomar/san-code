"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ReadmissionTable({ readmissions = [] }) {
  // Dedupe to latest per student+ailment, limit to 10
  const unique = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const r of (readmissions || [])) {
      const key = `${r.admNo}__${r.ailment.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(r);
      if (result.length >= 10) break;
    }
    return result;
  }, [readmissions]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Readmissions Within 7 Days
          {readmissions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {readmissions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unique.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No readmissions detected
          </p>
        ) : (
          <div className="space-y-2">
            {unique.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
              >
                <div className="min-w-0">
                  <span className="font-medium">{r.admNo}</span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {r.ailment}
                  </span>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(r.firstVisit)} → {formatDate(r.returnVisit)}
                  <span className="ml-1.5 font-medium text-amber-600 dark:text-amber-400">
                    {r.daysBetween}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
