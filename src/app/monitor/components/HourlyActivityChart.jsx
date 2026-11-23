"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Clock, Users, UserCog } from "lucide-react";

export default function HourlyActivityChart({ hourlyData }) {
  const [hoveredHour, setHoveredHour] = useState(null);

  if (!hourlyData || hourlyData.length === 0) return null;

  // Filter to working clinic hours: 06:00 to 22:00 (or full 24h if non-zero outside)
  const relevantHours = hourlyData.filter((h) => h.hour >= 5 && h.hour <= 22);
  const maxTotal = Math.max(...relevantHours.map((h) => h.total), 1);
  const totalConsultations = hourlyData.reduce((acc, h) => acc + h.total, 0);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                Today&apos;s Clinic Hourly Throughput
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Consultation frequency across school operating hours (EAT / Nairobi)
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              Students
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-purple-500" />
              Staff
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {totalConsultations === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400">
            No consultations recorded in clinic logs for today yet.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bars container */}
            <div className="h-36 flex items-end gap-1.5 pt-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              {relevantHours.map((h) => {
                const heightPercent = (h.total / maxTotal) * 100;
                const isHovered = hoveredHour?.hour === h.hour;

                return (
                  <div
                    key={h.hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredHour(h)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-mono shadow-lg whitespace-nowrap pointer-events-none">
                        <div>{h.label} — {h.total} visit{h.total !== 1 ? "s" : ""}</div>
                        <div className="text-blue-400 dark:text-blue-600">{h.students} students, {h.staff} staff</div>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[28px] rounded-t transition-all duration-200 flex flex-col justify-end overflow-hidden ${
                        h.total > 0
                          ? isHovered
                            ? "ring-2 ring-emerald-500"
                            : "opacity-90 hover:opacity-100"
                          : "bg-zinc-100 dark:bg-zinc-800/40"
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    >
                      {h.staff > 0 && (
                        <div
                          className="bg-purple-500 transition-all"
                          style={{ height: `${(h.staff / (h.total || 1)) * 100}%` }}
                        />
                      )}
                      {h.students > 0 && (
                        <div
                          className="bg-blue-500 transition-all"
                          style={{ height: `${(h.students / (h.total || 1)) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis hour labels */}
            <div className="flex gap-1.5 text-[10px] font-mono text-zinc-400">
              {relevantHours.map((h) => (
                <div key={h.hour} className="flex-1 text-center truncate">
                  {h.hour % 2 === 0 ? h.hour : ""}
                </div>
              ))}
            </div>

            {/* Peak hour callout */}
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Active consultation window
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Total consultations today: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalConsultations}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
