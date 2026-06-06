"use client";

import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { Loader, Printer } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchAnalyticsData,
  fetchArchivedMonths,
} from "./services";
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
import MedicationInventory from "./medication-inventory";
import NurseSettings from "./nurse-settings";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lazy-loaded data
  const [archivedMonths, setArchivedMonths] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const tabDataLoaded = useRef({ trends: false });

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
        const data = await fetchAnalyticsData();
        if (devMode) {
          console.log("analyticsData", data);
        }
        setAnalyticsData(data);
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
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="settings">Schedule & Settings</TabsTrigger>
          <TabsTrigger value="admin">Admin Report</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (existing dashboard + attendance impact) */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <OutbreakAlert outbreaks={analyticsData?.todayStats?.outbreaks} />
            <SummaryCards computed={analyticsData?.computed} todayStats={analyticsData?.todayStats} />
            <AttendanceImpact impact={analyticsData?.computed?.attendanceImpact} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MonthlyTrendChart reportData={analyticsData?.reportData} />
              </div>
              <div className="lg:col-span-1">
                <DiseaseDistributionChart distribution={analyticsData?.computed?.diseaseDistribution} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PeakHoursChart peakHours={analyticsData?.computed?.peakHours} />
              </div>
              <div className="lg:col-span-1">
                <ReadmissionTable readmissions={analyticsData?.computed?.readmissions} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Alerts & Follow-ups */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            <ActionableAlerts
              outbreaks={analyticsData?.todayStats?.outbreaks}
            />
            <MedicationTracker medicationDue={analyticsData?.todayStats?.medicationDue} />
            <FollowUpList
              hospitalReferrals={analyticsData?.hospitalReferrals}
              readmissions={analyticsData?.computed?.readmissions}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Trends */}
        <TabsContent value="trends">
          <div className="space-y-6">
            <WeeklyComparison
              weekly={analyticsData?.computed?.weeklyComparison}
              reportData={analyticsData?.reportData}
              archivedMonths={archivedMonths}
            />
            <ClassBreakdown breakdown={analyticsData?.computed?.classBreakdown} />
          </div>
        </TabsContent>

        {/* Tab 4: Student Lookup */}
        <TabsContent value="student">
          <StudentLookup />
        </TabsContent>

        {/* Tab 5: Admin Report */}
        <TabsContent value="admin">
          <AdminReportExport
            todayStats={analyticsData?.todayStats}
            computed={analyticsData?.computed}
            hospitalReferrals={analyticsData?.hospitalReferrals}
          />
        </TabsContent>

        {/* Tab 6: Medication Inventory */}
        <TabsContent value="inventory">
          <MedicationInventory
            inventory={analyticsData?.medicationInventory}
            logs={analyticsData?.medicationLogs}
            onRefresh={async () => {
              try {
                const data = await fetchAnalyticsData();
                setAnalyticsData(data);
              } catch (err) {
                console.error("Failed to refresh analytics inventory:", err);
              }
            }}
          />
        </TabsContent>

        {/* Tab 7: Nurse Schedule Settings */}
        <TabsContent value="settings">
          <NurseSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
