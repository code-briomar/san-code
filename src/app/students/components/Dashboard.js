"use client";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Pill, Users } from "lucide-react";

export default function Dashboard({ stats, onPatientClick }) {
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  if (!stats) return null;

  // Only show if there's something important to display
  const hasAlerts = stats.outbreaks?.length > 0;
  const hasMedicationDue = stats.medicationDue?.length > 0;
  const hasActivity = stats.studentCount > 0;

  if (!hasAlerts && !hasMedicationDue && !hasActivity) return null;

  // Calculate total affected students and sort by severity
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
    <div className="w-full space-y-3">
      {/* Stats Row - Always visible */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {hasActivity && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span>
              <strong className="text-blue-600 dark:text-blue-400">{stats.studentCount}</strong> seen today
            </span>
          </div>
        )}

        {hasMedicationDue && (
          <div className="flex items-center gap-1">
            <Pill className="w-4 h-4 text-orange-500" />
            <span className="text-orange-600 dark:text-orange-400">
              <strong>{stats.medicationDue.length}</strong> medication due
            </span>
            <div className="flex gap-1 ml-1">
              {stats.medicationDue.slice(0, 2).map((patient, index) => (
                <button
                  key={index}
                  onClick={() => onPatientClick(patient.admNo)}
                  className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800/50"
                >
                  {patient.admNo}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Alerts Section */}
      {hasAlerts && (
        <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
          {/* Summary Header - Always visible */}
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-sm">
                {alertCount} health {alertCount === 1 ? "alert" : "alerts"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({totalAffected} students affected)
              </span>
            </div>
            {alertsExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Expanded Alerts */}
          {alertsExpanded && (
            <div className="p-2 space-y-2 bg-white dark:bg-zinc-900/50">
              {sortedOutbreaks.map((outbreak, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 border rounded-md text-sm ${getSeverityClasses(outbreak.count)}`}
                >
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${getSeverityIcon(outbreak.count)}`} />
                  <span className="font-medium">
                    {outbreak.count} students with "{outbreak.ailment}"
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
