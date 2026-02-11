"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { computeMonthTotal, computeTopAilment } from "./utils";

const cards = [
  {
    key: "seen-today",
    title: "Students Seen Today",
    icon: Users,
    getValue: (_, todayStats) => todayStats?.studentCountToday ?? 0,
    format: (v) => String(v),
  },
  {
    key: "month-visits",
    title: "Total Visits This Month",
    icon: Activity,
    getValue: (reportData) => computeMonthTotal(reportData),
    format: (v) => String(v),
  },
  {
    key: "top-ailment",
    title: "Top Ailment",
    icon: TrendingUp,
    getValue: (reportData) => computeTopAilment(reportData),
    format: (v) => (v ? `${v.name} (${v.count})` : "None"),
  },
  {
    key: "outbreaks",
    title: "Outbreak Alerts",
    icon: AlertTriangle,
    getValue: (_, todayStats) => todayStats?.outbreaks?.length ?? 0,
    format: (v) => String(v),
  },
];

export default function SummaryCards({ reportData, todayStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ key, title, icon: Icon, getValue, format }) => {
        const value = getValue(reportData, todayStats);
        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(value)}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
