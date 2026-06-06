"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, UserCheck, AlertCircle } from "lucide-react";
export default function AttendanceImpact({ impact }) {
  if (!impact || (!impact.weekStudentDays && !impact.monthStudentDays)) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Student-Days This Week
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impact.weekStudentDays}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            days affected by health visits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Student-Days This Month
          </CardTitle>
          <UserCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impact.monthStudentDays}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            total days with health office visits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recurring Cases
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {impact.chronicStudents.length}
          </div>
          {impact.chronicStudents.length > 0 ? (
            <div className="mt-2 space-y-1">
              {impact.chronicStudents.slice(0, 5).map((s) => (
                <div
                  key={s.admNo}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {s.admNo}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {s.count} visits
                  </span>
                </div>
              ))}
              {impact.chronicStudents.length > 5 && (
                <p className="text-xs text-slate-400">
                  +{impact.chronicStudents.length - 5} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No students with 3+ visits this month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
