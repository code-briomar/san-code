"use client";

import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { Loader, Printer } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchReportData,
  fetchStudentRecords,
  fetchStudentsGoingToHospital,
  fetchArchivedMonths,
} from "./services";
import { fetchTodayStats } from "@/app/services";
import OutbreakAlert from "./outbreak-alert";
import SummaryCards from "./summary-cards";
import MonthlyTrendChart from "./monthly-trend-chart";
import DiseaseDistributionChart from "./disease-distribution-chart";
import PeakHoursChart from "./peak-hours-chart";
import ReadmissionTable from "./readmission-table";
import AttendanceImpact from "./attendance-impact";
import ActionableAlerts from "./actionable-alerts";
import MedicationTracker from "./medication-tracker";
import FollowUpList from "./follow-up-list";
import WeeklyComparison from "./weekly-comparison";
import ClassBreakdown from "./class-breakdown";
import StudentLookup from "./student-lookup";
import AdminReportExport from "./admin-report-export";

const Analytics = () => {
  const [reportData, setReportData] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lazy-loaded data
  const [hospitalReferrals, setHospitalReferrals] = useState(null);
  const [archivedMonths, setArchivedMonths] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const tabDataLoaded = useRef({ alerts: false, trends: false });

  const handlePrint = () => {
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    const originalTitle = document.title;
    document.title = `sanCode-Analytics-${stamp}`;
    window.print();
    document.title = originalTitle;
  };

  const handleTabChange = async (value) => {
    setActiveTab(value);
    if (value === "alerts" && !tabDataLoaded.current.alerts) {
      tabDataLoaded.current.alerts = true;
      const referrals = await fetchStudentsGoingToHospital();
      setHospitalReferrals(referrals || []);
    }
    if (value === "trends" && !tabDataLoaded.current.trends) {
      tabDataLoaded.current.trends = true;
      const months = await fetchArchivedMonths();
      setArchivedMonths(months?.data || []);
    }
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="no-print flex w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Follow-ups</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="student">Student Lookup</TabsTrigger>
          <TabsTrigger value="admin">Admin Report</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (existing dashboard + attendance impact) */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <OutbreakAlert outbreaks={todayStats?.outbreaks} />
            <SummaryCards reportData={reportData} todayStats={todayStats} />
            <AttendanceImpact records={studentRecords} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MonthlyTrendChart reportData={reportData} />
              </div>
              <div className="lg:col-span-1">
                <DiseaseDistributionChart reportData={reportData} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PeakHoursChart records={studentRecords} />
              </div>
              <div className="lg:col-span-1">
                <ReadmissionTable records={studentRecords} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Alerts & Follow-ups */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            <ActionableAlerts
              outbreaks={todayStats?.outbreaks}
              records={studentRecords}
            />
            <MedicationTracker medicationDue={todayStats?.medicationDue} />
            <FollowUpList
              hospitalReferrals={hospitalReferrals}
              records={studentRecords}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Trends */}
        <TabsContent value="trends">
          <div className="space-y-6">
            <WeeklyComparison
              records={studentRecords}
              reportData={reportData}
              archivedMonths={archivedMonths}
            />
            <ClassBreakdown records={studentRecords} />
          </div>
        </TabsContent>

        {/* Tab 4: Student Lookup */}
        <TabsContent value="student">
          <StudentLookup />
        </TabsContent>

        {/* Tab 5: Admin Report */}
        <TabsContent value="admin">
          <AdminReportExport
            reportData={reportData}
            todayStats={todayStats}
            studentRecords={studentRecords}
            hospitalReferrals={hospitalReferrals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
