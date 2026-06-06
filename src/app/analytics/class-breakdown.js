"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { School } from "lucide-react";
export default function ClassBreakdown({ breakdown }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!breakdown || !breakdown.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <School className="h-5 w-5 text-slate-500" />
            Class Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No class data available for this month
          </p>
        </CardContent>
      </Card>
    );
  }

  const textColor = isDark ? "#d4d4d8" : "#3f3f46";

  const chartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
    xAxis: {
      type: "value",
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: {
        lineStyle: { color: isDark ? "#27272a" : "#e4e4e7" },
      },
    },
    yAxis: {
      type: "category",
      data: [...breakdown].reverse().map((c) => c.className),
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: isDark ? "#3f3f46" : "#d4d4d8" } },
    },
    series: [
      {
        type: "bar",
        data: [...breakdown].reverse().map((c) => c.visits),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#6d28d9" },
            ],
          },
        },
        barMaxWidth: 20,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <School className="h-5 w-5 text-purple-500" />
          Class Breakdown — This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReactECharts
          option={chartOption}
          style={{ height: Math.max(200, breakdown.length * 32) }}
          opts={{ renderer: "svg" }}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead>Top Ailment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((c) => (
                <TableRow key={c.className}>
                  <TableCell className="font-medium">{c.className}</TableCell>
                  <TableCell className="text-right">{c.visits}</TableCell>
                  <TableCell className="text-right">
                    {c.uniqueStudents}
                  </TableCell>
                  <TableCell className="capitalize text-slate-500 dark:text-slate-400">
                    {c.topAilment}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
