"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";
import { computePeakHours } from "./utils";

echarts.use([BarChart, GridComponent, TooltipComponent, SVGRenderer]);

function formatHour(h) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

export default function PeakHoursChart({ records }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const hourlyData = useMemo(() => computePeakHours(records), [records]);

  // Only show hours 5am–8pm (typical school operating window)
  const filtered = useMemo(
    () => hourlyData.filter((d) => d.hour >= 5 && d.hour <= 20),
    [hourlyData]
  );

  const option = useMemo(() => {
    const textColor = isDark ? "#d4d4d8" : "#3f3f46";
    const borderColor = isDark ? "#3f3f46" : "#e4e4e7";

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#27272a" : "#fff",
        borderColor,
        textStyle: { color: textColor },
        formatter: (params) => {
          const d = params[0];
          return `${d.name}: <b>${d.value}</b> visit${d.value !== 1 ? "s" : ""}`;
        },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", top: "8%", containLabel: true },
      xAxis: {
        type: "category",
        data: filtered.map((d) => formatHour(d.hour)),
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 11 },
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
          type: "bar",
          data: filtered.map((d) => d.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#6d28d9" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 32,
        },
      ],
    };
  }, [filtered, isDark]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        Peak Visit Hours (This Month)
      </h4>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 280 }}
        opts={{ renderer: "svg" }}
        notMerge
      />
    </div>
  );
}
