"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  LucideLoader,
  Pill,
  Stethoscope,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { fetchStudentData, fetchStudentHistory } from "../services";

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admissionNumber = searchParams.get("admission_number");

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!admissionNumber) {
      toast.error("No admission number provided");
      router.push("/students");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const student = await fetchStudentData(admissionNumber);
      const historyData = await fetchStudentHistory(admissionNumber);

      if (!student) {
        toast.error("Student not found");
        router.push("/students");
        return;
      }

      setStudentData(student);
      setHistory(historyData || []);
      setLoading(false);
    };

    loadData();
  }, [admissionNumber, router]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate stats - handle both tempreading and tempReading field names
  const getTemp = (record) => {
    const temp = parseFloat(record.tempreading ?? record.tempReading);
    return isNaN(temp) ? null : temp;
  };

  const validTemps = history.map(getTemp).filter((t) => t !== null);
  const avgTemp = validTemps.length > 0
    ? (validTemps.reduce((sum, t) => sum + t, 0) / validTemps.length).toFixed(1)
    : "-";

  const stats = {
    totalVisits: history.length,
    avgTemp,
    feverCount: validTemps.filter((t) => t > 37).length,
    commonAilments: Object.entries(
      history.reduce((acc, r) => {
        if (r.ailment) {
          acc[r.ailment] = (acc[r.ailment] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
    commonMedications: Object.entries(
      history.reduce((acc, r) => {
        if (r.medication) {
          acc[r.medication] = (acc[r.medication] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {studentData?.admNo}
              </p>
              <p className="text-lg font-semibold">
                {studentData?.fName} {studentData?.sName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Class {studentData?.class}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase font-medium">Total Visits</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {stats.totalVisits}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs uppercase font-medium">Avg Temp</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {stats.avgTemp === "-" ? "-" : `${stats.avgTemp}°C`}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs uppercase font-medium">Fevers</span>
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.feverCount}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Stethoscope className="w-4 h-4" />
              <span className="text-xs uppercase font-medium">Top Ailment</span>
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {stats.commonAilments[0]?.[0] || "-"}
            </p>
          </div>
        </div>

        {/* Common Ailments & Medications */}
        {(stats.commonAilments.length > 0 || stats.commonMedications.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {stats.commonAilments.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
                <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Common Ailments
                </h3>
                <div className="space-y-2">
                  {stats.commonAilments.map(([ailment, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200">{ailment}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.commonMedications.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
                <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Common Medications
                </h3>
                <div className="space-y-2">
                  {stats.commonMedications.map(([medication, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200">{medication}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full History */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-neutral-800">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
            <h3 className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400">
              All Visits ({history.length})
            </h3>
          </div>

          {history.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {history.map((record, index) => {
                const temp = getTemp(record);
                return (
                <div key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(record.timestamp)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-mono ${
                        temp !== null && temp > 37
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {temp !== null ? `${temp}°C` : "-"}
                    </span>
                  </div>

                  {record.complain && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Complaint:</span>{" "}
                      {record.complain}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {record.ailment && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        <Stethoscope className="w-3 h-3" />
                        {record.ailment}
                      </span>
                    )}
                    {record.medication && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <Pill className="w-3 h-3" />
                        {record.medication}
                      </span>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              No visit history available
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudentHistory() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LucideLoader className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
