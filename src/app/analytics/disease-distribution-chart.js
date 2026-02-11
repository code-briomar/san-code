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
import { computeDiseaseDistribution } from "./utils";

echarts.use([PieChart, TooltipComponent, LegendComponent, SVGRenderer]);

export default function DiseaseDistributionChart({ reportData }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const distribution = useMemo(
    () => computeDiseaseDistribution(reportData),
    [reportData]
  );

  const option = useMemo(() => {
    const textColor = isDark ? "#d4d4d8" : "#3f3f46";
    const borderColor = isDark ? "#09090b" : "#ffffff";

    return {
      backgroundColor: "transparent",
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
