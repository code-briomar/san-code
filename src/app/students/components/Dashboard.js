"use client";
import { AlertTriangle, Pill, Users } from "lucide-react";

export default function Dashboard({ stats, onPatientClick }) {
  if (!stats) return null;

  // Only show if there's something important to display
  const hasAlerts = stats.outbreaks?.length > 0;
  const hasMedicationDue = stats.medicationDue?.length > 0;
  const hasActivity = stats.studentCount > 0;

  if (!hasAlerts && !hasMedicationDue && !hasActivity) return null;

  return (
    <div className="w-full space-y-3 mb-4">
      {/* Outbreak Alerts - Most Important */}
      {hasAlerts && (
        <div className="space-y-2">
          {stats.outbreaks.map((outbreak, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 animate-pulse" />
              <span className="font-semibold text-red-700 dark:text-red-300 text-sm">
                ALERT: {outbreak.count} students with "{outbreak.ailment}" today
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Row - Compact inline */}
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
    </div>
  );
}
