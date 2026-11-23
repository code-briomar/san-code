"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCog, History, Pill, CalendarCheck, FileCheck2 } from "lucide-react";

export default function MetricsCards({ counts }) {
  if (!counts) return null;

  const cards = [
    {
      title: "Student Clinic Records",
      value: counts.totalStudentClinicHistory?.toLocaleString() || "0",
      subtitle: "Lifetime patient visits",
      icon: History,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Staff Clinic Records",
      value: counts.totalStaffClinicHistory?.toLocaleString() || "0",
      subtitle: "Lifetime staff checkups",
      icon: FileCheck2,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Medication Transactions",
      value: counts.totalMedicationTransactions?.toLocaleString() || "0",
      subtitle: "Dispensation & stock audits",
      icon: Pill,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Active Follow-ups",
      value: counts.activeFollowUps?.toLocaleString() || "0",
      subtitle: "Scheduled return visits",
      icon: CalendarCheck,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Enrolled Students",
      value: counts.totalStudentsRegistered?.toLocaleString() || "0",
      subtitle: "Active student roster",
      icon: Users,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Registered Staff",
      value: counts.totalStaffRegistered?.toLocaleString() || "0",
      subtitle: "Teachers & support staff",
      icon: UserCog,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={i}
            className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-md ${c.bgColor} ${c.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {c.value}
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                {c.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
