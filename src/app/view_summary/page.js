"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchStaffData, fetchStudentData } from "./services";
import { base_api } from "@/lib/base_api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data_table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader,
  Activity,
  Users,
  UserCheck,
  Thermometer,
  FileSpreadsheet,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus
} from "lucide-react";

const ViewSummary = () => {
  const router = useRouter();
  const [summaryStudents, setSummaryStudents] = useState([]);
  const [summaryStaff, setSummaryStaff] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    const loadData = async () => {
      try {
        const response_staff_fetch = await fetchStaffData();
        const response_student_fetch = await fetchStudentData();

        setSummaryStudents(response_student_fetch?.data || []);
        setSummaryStaff(response_staff_fetch?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, []);

  // Excel download handler
  const handleExcelDownload = () => {
    const baseURL = base_api.defaults.baseURL;
    window.open(baseURL + "/export-report-excel", "_blank");
  };

  // Process data for statistics
  const totalStudents = summaryStudents.length;
  const totalStaff = summaryStaff.length;
  const totalVisits = totalStudents + totalStaff;

  // Compute all records combined for feed view
  const allRecords = [
    ...summaryStudents.map((s) => ({ ...s, role: "Student" })),
    ...summaryStaff.map((st) => ({ ...st, role: "Staff", class: "Staff Room" })),
  ];

  // Sort feed: most recent first
  const sortedFeed = [...allRecords].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Compute stats: High temperature alert count (>= 37.5 C)
  const highTempCount = allRecords.filter(
    (r) => r.tempReading && parseFloat(r.tempReading) >= 37.5
  ).length;

  // Compute top ailments
  const ailmentCounts = {};
  allRecords.forEach((r) => {
    if (r.ailment) {
      const cleanAilment = r.ailment.trim();
      ailmentCounts[cleanAilment] = (ailmentCounts[cleanAilment] || 0) + 1;
    }
  });
  const topAilments = Object.entries(ailmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Columns for student table
  const summary_columns_students = [
    {
      accessorKey: "fName",
      header: "First Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;
        return (
          <div className="flex space-x-1 font-medium text-slate-900 dark:text-slate-100">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "admNo",
      header: "Adm. No",
    },
  ];

  const summary_columns_large_screen_students = [
    {
      accessorKey: "admNo",
      header: "Adm. No",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">
          {row?.original?.admNo}
        </span>
      ),
    },
    {
      accessorKey: "fName",
      header: "Student Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;
        return (
          <div className="flex space-x-1 font-medium text-slate-900 dark:text-slate-100">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-600 dark:text-slate-400">
          {row?.original?.class}
        </span>
      ),
    },
    {
      accessorKey: "tempReading",
      header: "Temp (°C)",
      cell: ({ row }) => {
        const temp = parseFloat(row?.original?.tempReading);
        if (!temp) return <span className="text-slate-400">-</span>;
        const isHigh = temp >= 37.5;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isHigh
                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50"
            }`}
          >
            {temp}°C
          </span>
        );
      },
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-50/50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
          {row?.original?.ailment}
        </Badge>
      ),
    },
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row?.original?.medication || "None"}
        </Badge>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => {
        const dateObj = new Date(row?.original?.timestamp);
        const timestamp = dateObj.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });
        const isRecent = dateObj > new Date() - 172800000; // 2 days
        const colorClass = isRecent
          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
          : "text-slate-500 dark:text-slate-400";

        return <span className={`text-xs ${colorClass}`}>{timestamp}</span>;
      },
    },
  ];

  // Columns for staff table
  const summary_columns_staff = [
    {
      accessorKey: "idNo",
      header: "ID No",
    },
    {
      accessorKey: "fName",
      header: "First Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;
        return (
          <div className="flex space-x-1 font-medium text-slate-900 dark:text-slate-100">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
  ];

  const summary_columns_large_screen_staff = [
    {
      accessorKey: "idNo",
      header: "ID No",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">
          {row?.original?.idNo}
        </span>
      ),
    },
    {
      accessorKey: "fName",
      header: "Staff Member",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;
        return (
          <div className="flex space-x-1 font-medium text-slate-900 dark:text-slate-100">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "tempReading",
      header: "Temp (°C)",
      cell: ({ row }) => {
        const temp = parseFloat(row?.original?.tempReading);
        if (!temp) return <span className="text-slate-400">-</span>;
        const isHigh = temp >= 37.5;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isHigh
                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50"
            }`}
          >
            {temp}°C
          </span>
        );
      },
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-50/50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30">
          {row?.original?.ailment}
        </Badge>
      ),
    },
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row?.original?.medication || "None"}
        </Badge>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => {
        const dateObj = new Date(row?.original?.timestamp);
        const timestamp = dateObj.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });
        const isRecent = dateObj > new Date() - 259200000; // 3 days
        const colorClass = isRecent
          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
          : "text-slate-500 dark:text-slate-400";

        return <span className={`text-xs ${colorClass}`}>{timestamp}</span>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/40 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full shadow-sm hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                Clinic Visit Summary
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Overview of patient registration log over the last 7 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleExcelDownload}
              className="flex items-center gap-2 border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-800 flex-1 md:flex-none"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export Excel</span>
            </Button>

            <a
              href="/report"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-all hover:shadow-indigo-500/10 flex-1 md:flex-none"
            >
              <span>View Official Report</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Loading Indicator */}
        {pageLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Fetching records...</p>
          </div>
        )}

        {/* Content Section */}
        {!pageLoading && (
          <>
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Visits */}
              <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-20 h-20 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Visits
                  </CardDescription>
                  <CardTitle className="text-3xl font-extrabold">{totalVisits}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Active case files logged
                  </span>
                </CardContent>
              </Card>

              {/* Card 2: Students */}
              <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-20 h-20 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student Visits
                  </CardDescription>
                  <CardTitle className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {totalStudents}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {totalVisits > 0
                      ? `${Math.round((totalStudents / totalVisits) * 100)}% of total visits`
                      : "0% of total visits"}
                  </span>
                </CardContent>
              </Card>

              {/* Card 3: Staff */}
              <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-20 h-20 text-blue-600 dark:text-blue-400" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Staff Visits
                  </CardDescription>
                  <CardTitle className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {totalStaff}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {totalVisits > 0
                      ? `${Math.round((totalStaff / totalVisits) * 100)}% of total visits`
                      : "0% of total visits"}
                  </span>
                </CardContent>
              </Card>

              {/* Card 4: Fever Watch */}
              <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <Thermometer className="w-20 h-20 text-rose-600 dark:text-rose-400" />
                </div>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fever Watch
                    </CardDescription>
                    <CardTitle
                      className={`text-3xl font-extrabold ${
                        highTempCount > 0 ? "text-rose-600 dark:text-rose-400" : ""
                      }`}
                    >
                      {highTempCount}
                    </CardTitle>
                  </div>
                  {highTempCount > 0 && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Temperatures recorded &ge; 37.5°C
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Top Ailments Summary Bar */}
            {topAilments.length > 0 && (
              <div className="bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Top concerns reported:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topAilments.map(([name, count], idx) => (
                    <Badge
                      key={name}
                      variant="outline"
                      className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-zinc-700 text-xs py-1 font-medium"
                    >
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">#{idx + 1}</span>
                      {name} ({count} case{count > 1 ? "s" : ""})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Workspace Directories with Tabs */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 mb-6">
                <TabsTrigger value="feed" className="px-5 py-2">
                  Activity Feed
                </TabsTrigger>
                <TabsTrigger value="students" className="px-5 py-2">
                  Students ({totalStudents})
                </TabsTrigger>
                <TabsTrigger value="staff" className="px-5 py-2">
                  Staff ({totalStaff})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Overview Feed */}
              <TabsContent value="feed" className="space-y-4 outline-none">
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Activity Log</CardTitle>
                    <CardDescription>
                      Chronological stream of clinic visits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sortedFeed.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        No activity recorded in the last 7 days.
                      </div>
                    ) : (
                      <div className="relative border-l border-slate-200 dark:border-zinc-800 ml-3 md:ml-4 space-y-6 py-2">
                        {sortedFeed.map((record, index) => {
                          const tempVal = parseFloat(record.tempReading);
                          const isHighTemp = tempVal >= 37.5;
                          const dateStr = new Date(record.timestamp).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          });

                          return (
                            <div key={index} className="relative pl-6 md:pl-8 group">
                              {/* Dot Timeline Marker */}
                              <div
                                className={`absolute left-0 -translate-x-[50%] top-1.5 rounded-full border-4 bg-white dark:bg-zinc-950 transition-transform group-hover:scale-125 w-4 h-4 ${
                                  isHighTemp
                                    ? "border-red-500 shadow-sm shadow-red-200 dark:shadow-none"
                                    : "border-indigo-500"
                                }`}
                              />

                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50/50 dark:bg-zinc-900/30 hover:bg-slate-50 dark:hover:bg-zinc-900/60 p-4 rounded-lg border border-slate-100 dark:border-zinc-800/40 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                      {record.fName} {record.sName}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] uppercase font-bold py-0 ${
                                        record.role === "Student"
                                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                                          : "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400"
                                      }`}
                                    >
                                      {record.role}
                                    </Badge>
                                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                      {record.role === "Student"
                                        ? `Adm: ${record.admNo}`
                                        : `ID: ${record.idNo}`}
                                    </span>
                                    {record.class && (
                                      <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium">
                                        {record.class}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                      Ailment:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-amber-50/20 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 font-medium"
                                    >
                                      {record.ailment || "Not specified"}
                                    </Badge>

                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">
                                      Medication:
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-medium"
                                    >
                                      {record.medication || "None"}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/50">
                                  {tempVal ? (
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                        isHighTemp
                                          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                          : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                      }`}
                                    >
                                      {tempVal}°C
                                    </span>
                                  ) : null}

                                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{dateStr}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Students Directory */}
              <TabsContent value="students" className="space-y-4 outline-none">
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Students Directory</CardTitle>
                    <CardDescription>
                      Full table of students checked into the clinic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="md:hidden">
                      <DataTable
                        data={summaryStudents}
                        columns={summary_columns_students}
                      />
                    </div>

                    <div className="hidden md:block">
                      <DataTable
                        data={summaryStudents}
                        columns={summary_columns_large_screen_students}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Staff Directory */}
              <TabsContent value="staff" className="space-y-4 outline-none">
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Staff Directory</CardTitle>
                    <CardDescription>
                      Full table of staff checked into the clinic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="md:hidden">
                      <DataTable
                        data={summaryStaff}
                        columns={summary_columns_staff}
                      />
                    </div>

                    <div className="hidden md:block">
                      <DataTable
                        data={summaryStaff}
                        columns={summary_columns_large_screen_staff}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewSummary;
