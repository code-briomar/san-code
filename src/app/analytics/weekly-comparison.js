"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Loader,
} from "lucide-react";
import { fetchArchivedReport } from "./services";

function computeMonthTotal(reportData) {
  if (!reportData?.length) return 0;
  return reportData.reduce((total, row) => {
    for (let d = 1; d <= 31; d++) total += Number(row[String(d)]) || 0;
    return total;
  }, 0);
}

function computeTopAilment(reportData) {
  if (!reportData?.length) return null;
  let best = null;
  for (const row of reportData) {
    let sum = 0;
    for (let d = 1; d <= 31; d++) sum += Number(row[String(d)]) || 0;
    if (sum > 0 && (!best || sum > best.count)) {
      best = { name: row.disease, count: sum };
    }
  }
  return best;
}

function computeMonthComparison(currentReport, archivedReport) {
  if (!currentReport?.length || !archivedReport?.length) return null;

  const currentTotal = computeMonthTotal(currentReport);
  const archivedTotal = computeMonthTotal(archivedReport);

  const currentTop = computeTopAilment(currentReport);
  const archivedTop = computeTopAilment(archivedReport);

  return {
    currentMonth: { total: currentTotal, topAilment: currentTop },
    previousMonth: { total: archivedTotal, topAilment: archivedTop },
    percentChange:
      archivedTotal > 0
        ? Math.round(
            ((currentTotal - archivedTotal) / archivedTotal) * 100
          )
        : null,
  };
}

function ChangeIndicator({ percent }) {
  if (percent === null || percent === undefined) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        N/A
      </span>
    );
  }
  if (percent === 0) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-xs text-slate-500 dark:text-slate-400"
      >
        <Minus className="h-3 w-3" />
        No change
      </Badge>
    );
  }
  // For health visits: increase = concerning (red), decrease = good (green)
  const isIncrease = percent > 0;
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs ${
        isIncrease
          ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
          : "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
      }`}
    >
      {isIncrease ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isIncrease ? "+" : ""}
      {percent}%
    </Badge>
  );
}

export default function WeeklyComparison({ weekly, reportData, archivedMonths }) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [archivedReport, setArchivedReport] = useState(null);
  const [loadingArchive, setLoadingArchive] = useState(false);

  const monthly = useMemo(
    () => computeMonthComparison(reportData, archivedReport),
    [reportData, archivedReport]
  );

  const handleMonthSelect = async (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (!month) {
      setArchivedReport(null);
      return;
    }
    setLoadingArchive(true);
    const res = await fetchArchivedReport(month);
    setArchivedReport(res?.data || []);
    setLoadingArchive(false);
  };

  return (
    <div className="space-y-6">
      {/* Week over Week */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-5 w-5 text-blue-500" />
            Week-over-Week Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!weekly ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Not enough data for weekly comparison
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-1">
                  This Week
                </p>
                <p className="text-2xl font-bold">
                  {weekly.thisWeek.visits}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  visits ({weekly.thisWeek.uniqueStudents} students)
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Last Week
                </p>
                <p className="text-2xl font-bold">
                  {weekly.lastWeek.visits}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  visits ({weekly.lastWeek.uniqueStudents} students)
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4 flex flex-col justify-center items-center">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Change
                </p>
                <ChangeIndicator percent={weekly.percentChange} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month over Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-5 w-5 text-purple-500" />
            Month-over-Month Comparison
          </CardTitle>
          {archivedMonths && (
            <select
              value={selectedMonth}
              onChange={handleMonthSelect}
              className="rounded-md border border-slate-200 dark:border-neutral-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
            >
              <option value="">Select previous month</option>
              {archivedMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </CardHeader>
        <CardContent>
          {!archivedMonths ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Switch to the Trends tab to load archived data
            </p>
          ) : !selectedMonth ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a previous month to compare
            </p>
          ) : loadingArchive ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader className="h-4 w-4 animate-spin" />
              Loading archived report...
            </div>
          ) : !monthly ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No data available for the selected month
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold">
                  {monthly.currentMonth.total}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  visits &middot; Top:{" "}
                  {monthly.currentMonth.topAilment?.name || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {selectedMonth}
                </p>
                <p className="text-2xl font-bold">
                  {monthly.previousMonth.total}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  visits &middot; Top:{" "}
                  {monthly.previousMonth.topAilment?.name || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-neutral-800 p-4 flex flex-col justify-center items-center">
                <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Change
                </p>
                <ChangeIndicator percent={monthly.percentChange} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
