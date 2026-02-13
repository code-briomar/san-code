"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader,
  Calendar,
  Thermometer,
  TrendingUp,
  Stethoscope,
  Pill,
  ExternalLink,
} from "lucide-react";
import { fetchStudentData, fetchStudentHistory } from "./services";
import { computeStudentLookupStats } from "./utils";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function StudentLookup() {
  const [admNo, setAdmNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const trimmed = admNo.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setStudent(null);
    setHistory([]);
    setStats(null);

    const [studentData, historyData] = await Promise.all([
      fetchStudentData(trimmed),
      fetchStudentHistory(trimmed),
    ]);

    if (!studentData) {
      setError("Student not found");
      setLoading(false);
      return;
    }

    setStudent(studentData);
    setHistory(historyData || []);
    setStats(computeStudentLookupStats(historyData || []));
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Search className="h-5 w-5 text-blue-500" />
            Student Health Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter admission number"
              value={admNo}
              onChange={(e) => setAdmNo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-xs font-mono"
            />
            <Button onClick={handleSearch} disabled={loading || !admNo.trim()}>
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {student && stats && (
        <>
          {/* Profile */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                    {student.admNo}
                  </p>
                  <p className="text-lg font-semibold">
                    {student.fName} {student.sName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Class {student.class}
                    {student.house ? ` · ${student.house}` : ""}
                  </p>
                </div>
                <Link
                  href={`/students/history?admission_number=${student.admNo}`}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  Full history
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">
                  Total Visits
                </span>
              </div>
              <p className="text-2xl font-bold">{stats.totalVisits}</p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">Avg Temp</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.avgTemp ? `${stats.avgTemp}°C` : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">Fevers</span>
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.feverCount}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Stethoscope className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">
                  Top Ailment
                </span>
              </div>
              <p className="text-sm font-bold">
                {stats.commonAilments[0]?.[0] || "-"}
              </p>
            </div>
          </div>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase font-semibold text-slate-500 dark:text-slate-400">
                Recent Visits ({Math.min(history.length, 10)} of{" "}
                {history.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {history.slice(0, 10).map((record, index) => {
                    const temp = parseFloat(
                      record.tempreading ?? record.tempReading
                    );
                    const hasTemp = !isNaN(temp);
                    return (
                      <div key={index} className="py-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatDate(record.timestamp)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatTime(record.timestamp)}
                            </span>
                          </div>
                          <span
                            className={`text-sm font-mono ${
                              hasTemp && temp > 37
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {hasTemp ? `${temp}°C` : "-"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {record.ailment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              <Stethoscope className="w-3 h-3" />
                              {record.ailment}
                            </span>
                          )}
                          {record.medication && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
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
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No visit history available
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
