"use client";

import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { Loader, Printer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchReportData, fetchStudentRecords } from "./services";
import { fetchTodayStats } from "@/app/services";
import OutbreakAlert from "./outbreak-alert";
import SummaryCards from "./summary-cards";
import MonthlyTrendChart from "./monthly-trend-chart";
import DiseaseDistributionChart from "./disease-distribution-chart";
import PeakHoursChart from "./peak-hours-chart";
import ReadmissionTable from "./readmission-table";

const Analytics = () => {
  const [reportData, setReportData] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    const originalTitle = document.title;
    document.title = `sanCode-Analytics-${stamp}`;
    window.print();
    document.title = originalTitle;
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [reportRes, statsRes, records] = await Promise.all([
          fetchReportData(),
          fetchTodayStats(),
          fetchStudentRecords(),
        ]);

        if (devMode) {
          console.log("reportData", reportRes);
          console.log("todayStats", statsRes);
          console.log("studentRecords", records?.length);
        }

        setReportData(reportRes?.data ?? []);
        setTodayStats(statsRes);
        setStudentRecords(records);
      } catch (error) {
        if (devMode) {
          console.error("An error occurred while fetching analytics data:", error);
        }
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="m-4 md:m-10">
        <div className="flex items-center justify-between no-print">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Analytics
          </h3>
          <Link href="/" className="text-blue-500 underline">
            Home
          </Link>
        </div>
        <div className="mt-16 flex justify-center">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-print-root m-4 md:m-10">
      <div className="flex items-center justify-between no-print">
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          Analytics
        </h3>
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-blue-500 underline text-sm">
            Home
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print-show mb-4">
        <h2 className="text-lg font-bold">sanCode Analytics Dashboard</h2>
        <p className="text-xs text-gray-600">
          Printed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Outbreak Alert */}
        <OutbreakAlert outbreaks={todayStats?.outbreaks} />

        {/* Summary Cards */}
        <SummaryCards reportData={reportData} todayStats={todayStats} />

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyTrendChart reportData={reportData} />
          </div>
          <div className="lg:col-span-1">
            <DiseaseDistributionChart reportData={reportData} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PeakHoursChart records={studentRecords} />
          </div>
          <div className="lg:col-span-1">
            <ReadmissionTable records={studentRecords} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
