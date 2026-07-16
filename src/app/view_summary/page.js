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
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader,
  FileSpreadsheet,
  Clock
} from "lucide-react";

const ViewSummary = () => {
  const router = useRouter();
  const [summaryStudents, setSummaryStudents] = useState([]);
  const [summaryStaff, setSummaryStaff] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("");

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

  const totalStudents = summaryStudents.length;
  const totalStaff = summaryStaff.length;

  // Compute all records combined for feed view
  const allRecords = [
    ...summaryStudents.map((s) => ({ ...s, role: "Student" })),
    ...summaryStaff.map((st) => ({ ...st, role: "Staff", class: "Staff Room" })),
  ];

  // Sort feed: most recent first
  const sortedFeed = [...allRecords].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Filtered feed by timeFilter string
  const filteredFeed = sortedFeed.filter((record) => {
    if (!timeFilter) return true;
    const dateObj = new Date(record.timestamp);
    const timestamp = dateObj.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return timestamp.toLowerCase().includes(timeFilter.toLowerCase());
  });

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
        <span className="font-medium text-slate-700 dark:text-slate-300">
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
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {temp}°C
          </span>
        );
      },
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700">
          {row?.original?.ailment}
        </Badge>
      ),
    },
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent">
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
        return <span className="text-xs text-slate-500 dark:text-slate-450">{timestamp}</span>;
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
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {temp}°C
          </span>
        );
      },
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700">
          {row?.original?.ailment}
        </Badge>
      ),
    },
    {
      accessorKey: "medication",
      header: "Medication",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-transparent">
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
        return <span className="text-xs text-slate-500 dark:text-slate-450">{timestamp}</span>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
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
                Sanatorium Visit Summary
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-450">
                Overview of patient registration log over the last 7 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleExcelDownload}
              size="sm"
              className="flex items-center gap-1.5 border-slate-300 dark:border-zinc-800 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </Button>

            <a
              href="/report"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 rounded-md shadow-sm transition-all"
            >
              <span>View Official Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Loading Indicator */}
        {pageLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader className="w-10 h-10 animate-spin text-slate-900 dark:text-slate-100" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Fetching records...</p>
          </div>
        )}

        {/* Content Section */}
        {!pageLoading && (
          <>
            {/* Workspace Directories with Tabs */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 mb-4">
                <TabsTrigger value="feed" className="px-5 py-1.5 text-xs font-medium">
                  Activity Feed
                </TabsTrigger>
                <TabsTrigger value="students" className="px-5 py-1.5 text-xs font-medium">
                  Students ({totalStudents})
                </TabsTrigger>
                <TabsTrigger value="staff" className="px-5 py-1.5 text-xs font-medium">
                  Staff ({totalStaff})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Overview Feed */}
              <TabsContent value="feed" className="space-y-4 outline-none">
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">Recent Activity Log</CardTitle>
                        <CardDescription className="text-xs">
                          Chronological stream of sanatorium visits
                        </CardDescription>
                      </div>
                      
                      {/* Search Feed by Date/Time */}
                      <div className="w-full sm:w-72">
                        <Input
                          placeholder="Search by date/time (e.g. '16 Jul', '19:30')..."
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="w-full h-9 text-xs border-slate-300 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredFeed.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        {timeFilter ? "No matches found for that time/date." : "No activity recorded in the last 7 days."}
                      </div>
                    ) : (
                      <div className="relative border-l border-slate-250 dark:border-zinc-800 ml-3 md:ml-4 space-y-4 py-1">
                        {filteredFeed.map((record, index) => {
                          const tempVal = parseFloat(record.tempReading);
                          const dateStr = new Date(record.timestamp).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          });

                          return (
                            <div key={index} className="relative pl-6 md:pl-8 group">
                              {/* Dot Timeline Marker */}
                              <div
                                className="absolute left-0 -translate-x-[50%] top-2 rounded-full border-4 bg-white dark:bg-zinc-950 transition-transform group-hover:scale-125 w-3.5 h-3.5 border-slate-400 dark:border-slate-600"
                              />

                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50/50 dark:bg-zinc-900/10 hover:bg-slate-50 dark:hover:bg-zinc-900/30 p-3 rounded-lg border border-slate-100 dark:border-zinc-900/40 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                      {record.fName} {record.sName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] uppercase font-bold py-0 px-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-zinc-700"
                                    >
                                      {record.role}
                                    </Badge>
                                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                      {record.role === "Student"
                                        ? `Adm: ${record.admNo}`
                                        : `ID: ${record.idNo}`}
                                    </span>
                                    {record.class && (
                                      <span className="text-[10px] bg-slate-150 dark:bg-zinc-850 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-semibold">
                                        {record.class}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                      Ailment:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 bg-transparent text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-medium"
                                    >
                                      {record.ailment || "Not specified"}
                                    </Badge>

                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                                      Medication:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border-transparent font-medium"
                                    >
                                      {record.medication || "None"}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/50">
                                  {tempVal ? (
                                    <span
                                      className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-800 dark:text-slate-200"
                                    >
                                      {tempVal}°C
                                    </span>
                                  ) : null}

                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                                    <Clock className="w-3 h-3" />
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
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Students Directory</CardTitle>
                    <CardDescription className="text-xs">
                      Full table of students checked into the sanatorium
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
                <Card className="border border-slate-200 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Staff Directory</CardTitle>
                    <CardDescription className="text-xs">
                      Full table of staff checked into the sanatorium
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
