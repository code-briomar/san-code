"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";
echarts.use([PieChart, TooltipComponent, LegendComponent, SVGRenderer]);

export default function DiseaseDistributionChart({ distribution = [] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const option = useMemo(() => {
    const textColor = isDark ? "#d4d4d8" : "#3f3f46";
    const borderColor = isDark ? "#09090b" : "#ffffff";
    const greyscalePalette = isDark
      ? ['#fafafa', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a']
      : ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'];

    return {
      backgroundColor: "transparent",
      color: greyscalePalette,
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#27272a" : "#fff",
        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
        textStyle: { color: textColor },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "center",
        textStyle: { color: textColor, fontSize: 12 },
        type: "scroll",
      },
      media: [
        {
          query: { maxWidth: 500 },
          option: {
            legend: {
              orient: "horizontal",
              right: "auto",
              top: "auto",
              bottom: 0,
              left: "center",
            },
            series: [
              {
                center: ["50%", "40%"],
                radius: ["40%", "65%"],
              },
            ],
          },
        },
      ],
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: borderColor,
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              color: textColor,
            },
          },
          data: distribution,
        },
      ],
    };
  }, [distribution, isDark]);

  if (!distribution.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No disease data for this month
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
        Disease Distribution
      </h4>

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
