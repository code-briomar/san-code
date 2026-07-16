"use client";

import { devMode } from "@/lib/dev_mode";
import Link from "next/link";
import { Loader, Printer, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchAnalyticsData } from "./services";
import MonthlyTrendChart from "./monthly-trend-chart";
import FollowUpList from "./follow-up-list";

const Analytics = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
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
        <div className="flex items-center justify-between no-print border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full shadow-sm hover:scale-105 transition-transform border-zinc-300 dark:border-zinc-800"
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
    <div className="analytics-print-root min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 no-print">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full shadow-sm hover:scale-105 transition-transform border-zinc-300 dark:border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sanatorium Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                Visit trends & watchlists
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline mr-2">
              Home
            </Link>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs border-zinc-350 dark:border-zinc-850 font-medium">
              <Printer className="h-3.5 w-3.5" />
              <span>Print Report</span>
            </Button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print-show mb-4 border-b border-slate-350 pb-2">
          <h2 className="text-xl font-bold">sanCode Sanatorium Analytics</h2>
          <p className="text-xs text-slate-600">
            Printed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Unified Monochrome Layout */}
        <div className="space-y-6">
          <MonthlyTrendChart reportData={analyticsData?.reportData} />
          
          <FollowUpList
            hospitalReferrals={analyticsData?.hospitalReferrals}
            readmissions={analyticsData?.computed?.readmissions}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
