"use client";

import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { Loader, Printer, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchAnalyticsData } from "./services";
import OutbreakAlert from "./outbreak-alert";
import SummaryCards from "./summary-cards";
import MonthlyTrendChart from "./monthly-trend-chart";
import DiseaseDistributionChart from "./disease-distribution-chart";
import ReadmissionTable from "./readmission-table";
import ActionableAlerts from "./actionable-alerts";
import MedicationTracker from "./medication-tracker";
import FollowUpList from "./follow-up-list";
import StudentLookup from "./student-lookup";
import AdminReportExport from "./admin-report-export";
import MedicationInventory from "./medication-inventory";
import NurseSettings from "./nurse-settings";

const Analytics = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handlePrint = () => {
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    const originalTitle = document.title;
    document.title = `sanCode-Analytics-${stamp}`;
    window.print();
    document.title = originalTitle;
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
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
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between no-print border-b border-slate-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full shadow-sm hover:scale-105 transition-transform border-slate-300 dark:border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sanatorium Analytics
              </h1>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline">
            Home
          </Link>
        </div>
        <div className="py-20 flex justify-center">
          <Loader className="h-8 w-8 animate-spin text-slate-900 dark:text-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-print-root min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-4 no-print">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full shadow-sm hover:scale-105 transition-transform border-slate-300 dark:border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sanatorium Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                Insights, alerts, and management panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline mr-2">
              Home
            </Link>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs border-slate-300 dark:border-zinc-800 font-medium">
              <Printer className="h-3.5 w-3.5" />
              <span>Print Report</span>
            </Button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print-show mb-4 border-b border-slate-300 pb-2">
          <h2 className="text-xl font-bold">sanCode Sanatorium Analytics</h2>
          <p className="text-xs text-slate-650">
            Printed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="no-print flex w-full md:w-auto overflow-x-auto bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 mb-6">
            <TabsTrigger value="overview" className="px-5 py-1.5 text-xs font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="px-5 py-1.5 text-xs font-medium">
              Alerts & Watchlist
            </TabsTrigger>
            <TabsTrigger value="inventory" className="px-5 py-1.5 text-xs font-medium">
              Medication Inventory
            </TabsTrigger>
            <TabsTrigger value="admin" className="px-5 py-1.5 text-xs font-medium">
              Administration
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            <OutbreakAlert outbreaks={analyticsData?.todayStats?.outbreaks} />
            <SummaryCards computed={analyticsData?.computed} todayStats={analyticsData?.todayStats} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MonthlyTrendChart reportData={analyticsData?.reportData} />
              </div>
              <div className="lg:col-span-1">
                <DiseaseDistributionChart distribution={analyticsData?.computed?.diseaseDistribution} />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Alerts & Watchlist */}
          <TabsContent value="alerts" className="space-y-6 outline-none">
            <ActionableAlerts outbreaks={analyticsData?.todayStats?.outbreaks} />
            <MedicationTracker medicationDue={analyticsData?.todayStats?.medicationDue} />
            
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FollowUpList
                  hospitalReferrals={analyticsData?.hospitalReferrals}
                  readmissions={analyticsData?.computed?.readmissions}
                />
              </div>
              <div className="lg:col-span-1">
                <ReadmissionTable readmissions={analyticsData?.computed?.readmissions} />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Medication Inventory */}
          <TabsContent value="inventory" className="outline-none">
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

          {/* Tab 4: Administration */}
          <TabsContent value="admin" className="space-y-6 outline-none">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <NurseSettings />
              </div>
              <div>
                <AdminReportExport
                  todayStats={analyticsData?.todayStats}
                  computed={analyticsData?.computed}
                  hospitalReferrals={analyticsData?.hospitalReferrals}
                />
              </div>
            </div>

            <Card className="border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-white">Student Medical Record Lookup</CardTitle>
                <CardDescription className="text-xs">Search and view the history of individual students</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentLookup />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
