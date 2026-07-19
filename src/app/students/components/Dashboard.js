"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Pill, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Dashboard({ stats, onPatientClick, loading }) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center gap-1 text-sm text-slate-400 dark:text-slate-500">
        <span>Loading stats</span>
        <span className="flex gap-0.5">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </div>
    );
  }

  // Check what data we have
  const hasAlerts = stats.outbreaks?.length > 0;
  const hasMedicationDue = stats.medicationDue?.length > 0;
  const hasActivity = stats.studentCount > 0;

  // Show "No activity" message if nothing to display
  if (!hasAlerts && !hasMedicationDue && !hasActivity) {
    return (
      <div className="text-center text-sm text-slate-450 dark:text-slate-500 font-medium">
        No activity since yesterday
      </div>
    );
  }

  // Calculate total affected students and sort by severity
  const sortedOutbreaks = hasAlerts
    ? [...stats.outbreaks].sort((a, b) => b.count - a.count)
    : [];
  const totalAffected = sortedOutbreaks.reduce((sum, o) => sum + o.count, 0);
  const alertCount = sortedOutbreaks.length;

  // Severity style helper in greyscale
  const getSeverityClasses = (count) => {
    if (count >= 10) return "bg-slate-900 dark:bg-zinc-800 text-white dark:text-slate-100 border-slate-900 dark:border-zinc-700";
    if (count >= 5) return "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-slate-800 dark:text-slate-200";
    return "bg-transparent border-zinc-200 dark:border-zinc-850 text-slate-650 dark:text-slate-400";
  };

  const getSeverityIcon = (count) => {
    return "text-slate-700 dark:text-slate-300";
  };

  return (
    <div className="w-full">
      {/* Horizontal Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {/* Students Seen */}
        {hasActivity && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700 dark:text-slate-350" />
            <span className="text-slate-650 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white font-bold">{stats.studentCount}</strong> seen recently
              {stats.studentCountToday > 0 && (
                <span className="text-slate-450 dark:text-slate-500"> ({stats.studentCountToday} today)</span>
              )}
            </span>
          </div>
        )}

        {/* Divider */}
        {hasActivity && hasMedicationDue && (
          <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
        )}

        {/* Medication Due */}
        {hasMedicationDue && (
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-slate-700 dark:text-slate-350" />
            <span className="text-slate-800 dark:text-slate-250 font-medium">
              <strong>{stats.medicationDue.length}</strong> meds due
            </span>
            <div className="flex gap-1">
              {stats.medicationDue.slice(0, 2).map((patient, index) => (
                <button
                  key={index}
                  onClick={() => onPatientClick(patient.admNo)}
                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-850"
                >
                  {patient.admNo}
                </button>
              ))}
              {stats.medicationDue.length > 2 && (
                <span className="text-xs text-slate-500">+{stats.medicationDue.length - 2}</span>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        {(hasActivity || hasMedicationDue) && hasAlerts && (
          <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
        )}

        {/* Alerts Toggle */}
        {hasAlerts && (
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-slate-150 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-350 dark:border-zinc-750 font-medium"
          >
            <AlertTriangle className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span className="font-semibold text-xs">
              {alertCount} {alertCount === 1 ? "alert" : "alerts"}
            </span>
            {alertsExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-500" />
            ) : (
              <ChevronUp className="w-3 h-3 text-slate-500" />
            )}
          </button>
        )}

        {/* Calendar Link */}
        <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
        <Link
          href="/view_summary?tab=calendar"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-350 dark:border-zinc-750 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-700 dark:text-slate-350" />
          <span>Calendar Log</span>
        </Link>
      </div>

      {/* Expanded Alerts Panel */}
      {hasAlerts && alertsExpanded && (
        <div className="mt-2 p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-xl mx-auto shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
              Health Alerts
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">{totalAffected} students affected</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {sortedOutbreaks.map((outbreak, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-2 py-1.5 border rounded text-xs ${getSeverityClasses(outbreak.count)}`}
              >
                <AlertTriangle className={`w-3 h-3 flex-shrink-0 ${getSeverityIcon(outbreak.count)}`} />
                <span className="font-medium">
                  {outbreak.count} — {outbreak.ailment}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
