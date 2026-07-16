"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Users } from "lucide-react";

export default function Dashboard({ stats, onStaffClick, loading }) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center gap-1 text-sm text-gray-400 dark:text-gray-500">
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
  const hasActivity = stats.staffCount > 0;

  // Show "No activity" message if nothing to display
  if (!hasAlerts && !hasActivity) {
    return (
      <div className="text-center text-sm text-gray-400 dark:text-gray-500">
        No activity since yesterday
      </div>
    );
  }

  // Calculate total affected staff and sort by severity
  const sortedOutbreaks = hasAlerts
    ? [...stats.outbreaks].sort((a, b) => b.count - a.count)
    : [];
  const totalAffected = sortedOutbreaks.reduce((sum, o) => sum + o.count, 0);
  const alertCount = sortedOutbreaks.length;

  // Severity: red for count >= 10, yellow for count >= 5, gray for less
  const getSeverityClasses = (count) => {
    if (count >= 10) return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300";
    if (count >= 5) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300";
    return "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";
  };

  const getSeverityIcon = (count) => {
    if (count >= 10) return "text-red-600 dark:text-red-400";
    if (count >= 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-500 dark:text-gray-400";
  };

  return (
    <div className="w-full">
      {/* Horizontal Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {/* Staff Seen */}
        {hasActivity && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-blue-600 dark:text-blue-400">{stats.staffCount}</strong> seen recently
              {stats.staffCountToday > 0 && (
                <span className="text-gray-400 dark:text-gray-500"> ({stats.staffCountToday} today)</span>
              )}
            </span>
          </div>
        )}

        {/* Divider */}
        {hasActivity && hasAlerts && (
          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-neutral-700" />
        )}

        {/* Alerts Toggle */}
        {hasAlerts && (
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium text-sm">
              {alertCount} {alertCount === 1 ? "alert" : "alerts"}
            </span>
            {alertsExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Expanded Alerts Panel */}
      {hasAlerts && alertsExpanded && (
        <div className="mt-1 p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-neutral-700 rounded-lg max-w-1xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
              Health Alerts
            </h4>
            <span className="text-xs text-gray-500">{totalAffected} staff affected</span>
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
