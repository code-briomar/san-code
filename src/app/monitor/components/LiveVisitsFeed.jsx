"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  UserCog,
  Pill,
  Thermometer,
  Calendar,
  Clock,
  Building2,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LiveVisitsFeed({ studentVisits = [], staffVisits = [] }) {
  const [filterType, setFilterType] = useState("all"); // "all" | "student" | "staff"
  const [searchQuery, setSearchQuery] = useState("");

  // Merge and sort all visits chronologically
  const mergedVisits = useMemo(() => {
    const sList = (studentVisits || []).map((v) => ({
      id: `s_${v.history_id}`,
      rawId: v.history_id,
      patientType: "student",
      identifier: v.admNo,
      name: `${v.fName || ""} ${v.sName || ""}`.trim(),
      class: v.class,
      tempReading: v.tempReading,
      complaint: v.complain,
      ailment: v.ailment,
      medication: v.medication,
      timestamp: v.action_timestamp || v.timestamp,
      actionType: v.action_type || "VISIT",
      goingHospital: v.going_to_hospital === 1,
    }));

    const stList = (staffVisits || []).map((v) => ({
      id: `st_${v.history_id}`,
      rawId: v.history_id,
      patientType: "staff",
      identifier: v.idNo || v.staffRecordID,
      name: `${v.fName || ""} ${v.sName || ""}`.trim(),
      class: "Staff",
      tempReading: v.tempReading,
      complaint: v.complain,
      ailment: v.ailment,
      medication: v.medication,
      timestamp: v.timestamp,
      actionType: v.action_type || "VISIT",
      goingHospital: false,
    }));

    return [...sList, ...stList].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [studentVisits, staffVisits]);

  // Filter based on tabs and search query
  const filteredVisits = useMemo(() => {
    return mergedVisits.filter((item) => {
      if (filterType !== "all" && item.patientType !== filterType) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = String(item.identifier).toLowerCase().includes(q);
      const matchClass = String(item.class || "").toLowerCase().includes(q);
      const matchAilment = String(item.ailment || "").toLowerCase().includes(q);
      const matchComplaint = String(item.complaint || "").toLowerCase().includes(q);
      const matchMed = String(item.medication || "").toLowerCase().includes(q);

      return matchName || matchId || matchClass || matchAilment || matchComplaint || matchMed;
    });
  }, [mergedVisits, filterType, searchQuery]);

  const formatVisitTime = (timestamp) => {
    if (!timestamp) return "—";
    try {
      const d = new Date(timestamp);
      const rel = formatDistanceToNow(d, { addSuffix: true });
      const exact = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      return { rel, exact: `${dateStr} at ${exact}` };
    } catch {
      return { rel: timestamp, exact: timestamp };
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Live Clinical Encounters Stream
              <Badge variant="secondary" className="font-mono text-xs font-normal">
                {filteredVisits.length} entries
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time feed of patient admissions, diagnoses & treatments registered by the nurse
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Buttons */}
            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/50 dark:bg-zinc-800/50 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterType === "all"
                    ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType("student")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterType === "student"
                    ? "bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Students
              </button>
              <button
                type="button"
                onClick={() => setFilterType("staff")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterType === "staff"
                    ? "bg-white dark:bg-zinc-900 shadow-sm text-purple-600 dark:text-purple-400"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Staff
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search name, adm#, meds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-zinc-50/50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredVisits.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No patient visits matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/30 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Class / Role</th>
                  <th className="py-2.5 px-3">Temp</th>
                  <th className="py-2.5 px-3">Complaint</th>
                  <th className="py-2.5 px-3">Ailment / Diagnosis</th>
                  <th className="py-2.5 px-3">Medication</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {filteredVisits.map((item) => {
                  const time = formatVisitTime(item.timestamp);
                  const isStudent = item.patientType === "student";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Time */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block font-mono">
                          {time.rel}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {time.exact}
                        </span>
                      </td>

                      {/* Patient Name & Identifier */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-md shrink-0 ${
                              isStudent
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {isStudent ? (
                              <Users className="w-3.5 h-3.5" />
                            ) : (
                              <UserCog className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {item.name || "Unknown Patient"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {isStudent ? `Adm #${item.identifier}` : `Staff ID: ${item.identifier}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={
                            isStudent
                              ? "text-blue-600 border-blue-500/30 bg-blue-50/20 font-mono text-[10px]"
                              : "text-purple-600 border-purple-500/30 bg-purple-50/20 text-[10px]"
                          }
                        >
                          {item.class || "—"}
                        </Badge>
                      </td>

                      {/* Temperature */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.tempReading ? (
                          <span className="inline-flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300">
                            <Thermometer className="w-3 h-3 text-red-500" />
                            {item.tempReading}°C
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Complaint */}
                      <td className="py-2.5 px-3 max-w-[180px] truncate text-zinc-700 dark:text-zinc-300" title={item.complaint}>
                        {item.complaint || "—"}
                      </td>

                      {/* Diagnosis */}
                      <td className="py-2.5 px-3 max-w-[180px] truncate font-semibold text-zinc-800 dark:text-zinc-200" title={item.ailment}>
                        {item.ailment || "General Clinic"}
                      </td>

                      {/* Medication */}
                      <td className="py-2.5 px-3 max-w-[200px] truncate text-emerald-600 dark:text-emerald-400 font-medium" title={item.medication}>
                        <span className="inline-flex items-center gap-1">
                          <Pill className="w-3 h-3 shrink-0 text-emerald-500" />
                          {item.medication || "None recorded"}
                        </span>
                      </td>

                      {/* Status / Hospital referral */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.goingHospital ? (
                          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] gap-1">
                            <Building2 className="w-3 h-3" />
                            Hospital Referral
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-zinc-500 font-normal">
                            Treated in Clinic
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
