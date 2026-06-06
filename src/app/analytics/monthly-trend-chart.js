"use client";

import { useState, useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
function computeDailyTotals(reportData) {
  if (!reportData?.length) return [];
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const total = reportData.reduce(
      (sum, row) => sum + (Number(row[String(day)]) || 0),
      0
    );
    return { day, total };
  });
}

function computeDailyTotalsForDisease(reportData, name) {
  if (!reportData?.length || !name) return [];
  const row = reportData.find((r) => r.disease === name);
  if (!row) return [];
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return { day, total: Number(row[String(day)]) || 0 };
  });
}

function getActiveDiseases(reportData) {
  if (!reportData?.length) return [];
  return reportData
    .filter((row) => {
      for (let d = 1; d <= 31; d++) {
        if ((Number(row[String(d)]) || 0) > 0) return true;
      }
      return false;
    })
    .map((row) => row.disease)
    .sort((a, b) => a.localeCompare(b));
}

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

export default function MonthlyTrendChart({ reportData }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [selectedDisease, setSelectedDisease] = useState(null);
  const activeDiseases = useMemo(() => getActiveDiseases(reportData), [reportData]);

  const dailyData = useMemo(() => {
    if (selectedDisease) {
      return computeDailyTotalsForDisease(reportData, selectedDisease);
    }
    return computeDailyTotals(reportData);
  }, [reportData, selectedDisease]);

  const option = useMemo(() => {
    const textColor = isDark ? "#d4d4d8" : "#3f3f46";
    const borderColor = isDark ? "#3f3f46" : "#e4e4e7";
    const areaColor = isDark
      ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(59,130,246,0.35)" },
          { offset: 1, color: "rgba(59,130,246,0.02)" },
        ])
      : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(59,130,246,0.25)" },
          { offset: 1, color: "rgba(59,130,246,0.02)" },
        ]);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#27272a" : "#fff",
        borderColor: borderColor,
        textStyle: { color: textColor },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "8%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dailyData.map((d) => String(d.day)),
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor },
      },
      series: [
        {
          name: selectedDisease || "All diseases",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2.5, color: "#3b82f6" },
          itemStyle: { color: "#3b82f6" },
          areaStyle: { color: areaColor },
          data: dailyData.map((d) => d.total),
        },
      ],
    };
  }, [dailyData, isDark, selectedDisease]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Monthly Trend{selectedDisease ? ` — ${selectedDisease}` : ""}
        </h4>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              {selectedDisease || "All diseases"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedDisease(null)}>
              All diseases
            </DropdownMenuItem>
            {activeDiseases.map((name) => (
              <DropdownMenuItem
                key={name}
                onClick={() => setSelectedDisease(name)}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 320 }}
        opts={{ renderer: "svg" }}
        notMerge
      />
    </div>
  );
}
