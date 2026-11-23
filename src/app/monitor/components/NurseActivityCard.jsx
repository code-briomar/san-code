"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
  Users,
  Calendar,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function NurseActivityCard({ nurseData, serverTime }) {
  if (!nurseData) return null;

  const { status, statusLabel, minutesSinceLastActive, lastActiveRecord, todaySummary } = nurseData;

  const getStatusBadge = () => {
    switch (status) {
      case "active_now":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute" />
            <span className="ml-2">Active Right Now</span>
          </Badge>
        );
      case "recently_active":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            Active Recently ({minutesSinceLastActive}m ago)
          </Badge>
        );
      case "active_today":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Today
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-zinc-500 border-zinc-400/40 gap-1.5 px-3 py-1 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
            No Activity Logged Today
          </Badge>
        );
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Never";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Dispensary Nurse Activity
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Live verification of clinical station usage & consultation throughput
              </CardDescription>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Today's Counters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Today</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
              {todaySummary?.totalVisits || 0}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">consultations logged</p>
          </div>

          <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20">
            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Student Visits</p>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
              {todaySummary?.studentVisits || 0}
            </p>
            <p className="text-[10px] text-blue-500/70 mt-0.5">pupils treated</p>
          </div>

          <div className="p-3 rounded-lg border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20">
            <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Staff Visits</p>
            <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">
              {todaySummary?.staffVisits || 0}
            </p>
            <p className="text-[10px] text-purple-500/70 mt-0.5">teachers & workers</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20">
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Unique Students</p>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
              {todaySummary?.distinctStudentsSeen || 0}
            </p>
            <p className="text-[10px] text-emerald-500/70 mt-0.5">distinct attendees</p>
          </div>
        </div>

        {/* Most Recent Patient Visit Banner */}
        {lastActiveRecord ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/30 p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/60 dark:border-zinc-700/60 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                Latest Recorded Visit:
                <span className="font-bold text-zinc-900 dark:text-white">
                  {lastActiveRecord.name}
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-mono">
                  {lastActiveRecord.type === "Student" ? `Adm #${lastActiveRecord.identifier}` : `Staff ID ${lastActiveRecord.identifier}`}
                </Badge>
                {lastActiveRecord.class && lastActiveRecord.class !== "Staff" && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                    Class {lastActiveRecord.class}
                  </Badge>
                )}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-zinc-400" />
                {formatRelativeTime(lastActiveRecord.timestamp)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Complaint</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {lastActiveRecord.complaint || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Diagnosis / Ailment</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {lastActiveRecord.diagnosis || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Medication Dispensed</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Pill className="w-3 h-3 shrink-0" />
                  {lastActiveRecord.medication || "None recorded"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-zinc-400">
            No patient consultations have been recorded yet today.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
