"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  School,
  Users,
  Activity,
  AlertTriangle,
  CalendarClock,
  Search,
  Loader2,
  FileSpreadsheet,
  ChevronRight,
  Stethoscope,
  Clock,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Check,
  X,
  AlertCircle,
  History,
  Save,
  ArrowLeftCircle,
  ArrowRightCircle
} from "lucide-react";
import {
  fetchClassTeachers,
  fetchClassDetails,
  fetchClassAttendance,
  saveClassAttendance,
  fetchClassAttendanceHistory
} from "../services";

export default function ClassTeacherDashboard({ passcode }) {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingClass, setLoadingClass] = useState(false);
  const [classData, setClassData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab
  const [activeMainTab, setActiveMainTab] = useState("attendance"); // default to attendance for quick action

  // Roster Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Student for Detail Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  // --- ATTENDANCE STATE ---
  const todayStr = new Date().toISOString().split("T")[0];
  const [attDate, setAttDate] = useState(todayStr);
  const [attSession, setAttSession] = useState("morning");
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [savingAtt, setSavingAtt] = useState(false);
  const [attData, setAttData] = useState(null);
  const [attRoster, setAttRoster] = useState([]); // [ { admNo, fullName, house, status, remarks, clinicVisitToday, clinicDetails, isHospitalReferred } ]
  const [attSuccessMsg, setAttSuccessMsg] = useState("");
  const [attSearchTerm, setAttSearchTerm] = useState("");
  const [attStatusFilter, setAttStatusFilter] = useState("all");

  // Attendance History State
  const [attSubView, setAttSubView] = useState("take"); // "take" | "history"
  const [loadingHist, setLoadingHist] = useState(false);
  const [attHistory, setAttHistory] = useState([]);

  // 1. Fetch all class teachers list on mount
  useEffect(() => {
    async function loadTeachers() {
      setLoadingList(true);
      setErrorMsg("");
      try {
        const res = await fetchClassTeachers();
        if (res?.classTeachers) {
          setClassesList(res.classTeachers);
          if (res.classTeachers.length > 0) {
            setSelectedClass(res.classTeachers[0].class);
          }
        }
      } catch (err) {
        console.error("Failed to load class teachers list:", err);
        setErrorMsg("Unable to load class list. Please try again.");
      } finally {
        setLoadingList(false);
      }
    }
    loadTeachers();
  }, []);

  // 2. Fetch selected class overview details
  useEffect(() => {
    if (!selectedClass || !passcode) return;

    async function loadDetails() {
      setLoadingClass(true);
      setErrorMsg("");
      try {
        const data = await fetchClassDetails(selectedClass, passcode);
        if (data?.status === "success") {
          setClassData(data);
        }
      } catch (err) {
        console.error("Failed to load class details:", err);
        setErrorMsg("Failed to retrieve details for class " + selectedClass);
      } finally {
        setLoadingClass(false);
      }
    }
    loadDetails();
  }, [selectedClass, passcode]);

  // 3. Fetch Attendance Register when class, date, or session changes
  useEffect(() => {
    if (!selectedClass || !passcode || !attDate) return;

    async function loadAttendance() {
      setLoadingAtt(true);
      setAttSuccessMsg("");
      try {
        const res = await fetchClassAttendance(selectedClass, attDate, attSession, passcode);
        if (res?.status === "success") {
          setAttData(res);
          setAttRoster(res.roster || []);
        }
      } catch (err) {
        console.error("Failed to load attendance register:", err);
      } finally {
        setLoadingAtt(false);
      }
    }
    loadAttendance();
  }, [selectedClass, attDate, attSession, passcode]);

  // 4. Fetch Attendance History when switched to history sub-view
  useEffect(() => {
    if (attSubView !== "history" || !selectedClass || !passcode) return;

    async function loadHistory() {
      setLoadingHist(true);
      try {
        const currentMonth = attDate.slice(0, 7); // YYYY-MM
        const res = await fetchClassAttendanceHistory(selectedClass, currentMonth, passcode);
        if (res?.status === "success") {
          setAttHistory(res.history || []);
        }
      } catch (err) {
        console.error("Failed to load attendance history:", err);
      } finally {
        setLoadingHist(false);
      }
    }
    loadHistory();
  }, [attSubView, selectedClass, attDate, passcode]);

  // --- ATTENDANCE ACTIONS ---
  const handleMarkStudentStatus = (admNo, newStatus) => {
    setAttRoster(prev => prev.map(s => {
      if (s.admNo === admNo) {
        let newRemarks = s.remarks;
        if (newStatus === "medical" && !newRemarks && s.clinicVisitToday) {
          newRemarks = "At Sanatorium";
        }
        return { ...s, status: newStatus, remarks: newRemarks };
      }
      return s;
    }));
  };

  const handleStudentRemarkChange = (admNo, remarks) => {
    setAttRoster(prev => prev.map(s => s.admNo === admNo ? { ...s, remarks } : s));
  };

  const handleMarkAll = (targetStatus) => {
    setAttRoster(prev => prev.map(s => ({ ...s, status: targetStatus })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !attRoster.length) return;

    setSavingAtt(true);
    setAttSuccessMsg("");
    setErrorMsg("");

    try {
      const records = attRoster.map(s => ({
        admNo: s.admNo,
        status: s.status,
        remarks: s.remarks
      }));

      const teacherObj = classesList.find(c => c.class === selectedClass);
      const teacherName = teacherObj?.teacher_name || classData?.teacher || "Class Teacher";

      const res = await saveClassAttendance(selectedClass, {
        date: attDate,
        session: attSession,
        records,
        taken_by: teacherName
      }, passcode);

      if (res?.status === "success") {
        setAttSuccessMsg(`Attendance register saved successfully for ${selectedClass} on ${attDate}!`);
        // Refresh attendance data
        const fresh = await fetchClassAttendance(selectedClass, attDate, attSession, passcode);
        if (fresh?.status === "success") {
          setAttData(fresh);
          setAttRoster(fresh.roster || []);
        }
      }
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setErrorMsg("Failed to save attendance register. Please try again.");
    } finally {
      setSavingAtt(false);
    }
  };

  const handleShiftDate = (days) => {
    const current = new Date(attDate);
    current.setDate(current.getDate() + days);
    setAttDate(current.toISOString().split("T")[0]);
  };

  // Live attendance metrics calculation from current unsaved/saved roster state
  const liveAttMetrics = useMemo(() => {
    let present = 0, absent = 0, late = 0, medical = 0, excused = 0;
    attRoster.forEach(s => {
      if (s.status === "present") present++;
      else if (s.status === "absent") absent++;
      else if (s.status === "late") late++;
      else if (s.status === "medical") medical++;
      else if (s.status === "excused") excused++;
    });
    const total = attRoster.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, medical, excused, rate };
  }, [attRoster]);

  // Filtered attendance roster
  const filteredAttRoster = useMemo(() => {
    return attRoster.filter(s => {
      const name = (s.fullName || "").toLowerCase();
      const adm = String(s.admNo || "");
      const house = String(s.house || "").toLowerCase();
      const term = attSearchTerm.toLowerCase();

      const matchesSearch = !term || name.includes(term) || adm.includes(term) || house.includes(term);
      if (!matchesSearch) return false;

      if (attStatusFilter !== "all" && s.status !== attStatusFilter) {
        return false;
      }
      return true;
    });
  }, [attRoster, attSearchTerm, attStatusFilter]);

  // Filtered standard roster
  const filteredRoster = useMemo(() => {
    if (!classData?.roster) return [];
    return classData.roster.filter(s => {
      const name = `${s.fName || ""} ${s.sName || ""} ${s.tName || ""} ${s.fourthName || ""}`.toLowerCase();
      const adm = String(s.admNo || "");
      const house = String(s.house || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || name.includes(term) || adm.includes(term) || house.includes(term);
      if (!matchesSearch) return false;

      if (statusFilter === "visited_today") return s.visitsTodayCount > 0;
      if (statusFilter === "followup") return s.hasPendingFollowUp;
      if (statusFilter === "hospital") return s.isReferred;
      return true;
    });
  }, [classData?.roster, searchTerm, statusFilter]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    return d.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStudentClick = (student) => {
    const studentVisits = (classData?.recentVisits || []).filter(v => v.admNo === student.admNo);
    const studentFollowUps = (classData?.pendingFollowUps || []).filter(f => f.adm_no === student.admNo);

    setSelectedStudent({
      ...student,
      visits: studentVisits,
      followUps: studentFollowUps
    });
    setStudentModalOpen(true);
  };

  const handleExportCSV = () => {
    if (!classData?.roster?.length) return;
    const headers = ["Admission No", "First Name", "Second Name", "Class", "House", "Clinic Status", "Visits Today", "Referred to Hospital"];
    const rows = classData.roster.map(s => [
      s.admNo,
      s.fName || "",
      s.sName || "",
      s.class || "",
      s.house || "",
      s.clinicStatus || "Normal",
      s.visitsTodayCount || 0,
      s.isReferred ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Class_${selectedClass}_Health_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAttendanceCSV = () => {
    if (!attRoster.length) return;
    const headers = ["Admission No", "Full Name", "House", "Class", "Date", "Session", "Attendance Status", "Remarks", "At Clinic Today"];
    const rows = attRoster.map(s => [
      s.admNo,
      s.fullName,
      s.house,
      selectedClass,
      attDate,
      attSession,
      s.status.toUpperCase(),
      s.remarks || "",
      s.clinicVisitToday ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${selectedClass}_${attDate}_${attSession}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingList) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500">Loading class teachers...</p>
      </div>
    );
  }

  const selectedTeacherObj = classesList.find(c => c.class === selectedClass);

  return (
    <div className="space-y-6">
      {/* Class Selector Bar */}
      <Card className="bg-white border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <School className="h-5 w-5" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Class Stream
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-base font-bold bg-transparent text-zinc-900 dark:text-zinc-100 border-none outline-none cursor-pointer pr-4"
                >
                  {classesList.map((c) => (
                    <option key={c.class} value={c.class} className="dark:bg-zinc-900">
                      Grade {c.class} — {c.teacher_name} ({c.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={activeMainTab === "attendance" ? handleExportAttendanceCSV : handleExportCSV}
              className="text-xs h-8 gap-1.5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {activeMainTab === "attendance" ? "Export Attendance CSV" : "Export Roster CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Header */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full space-y-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-1">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1">
            <TabsTrigger value="attendance" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 font-semibold">
              <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Take Attendance Register
            </TabsTrigger>
            <TabsTrigger value="roster" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 font-semibold">
              <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Class Roster ({classData?.roster?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="visits" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 font-semibold">
              <Activity className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Clinic Visits ({classData?.recentVisits?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Alerts & Referrals
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================ */}
        {/* TAB: TAKE ATTENDANCE REGISTER */}
        {/* ============================================================ */}
        <TabsContent value="attendance" className="space-y-4 mt-0">
          {/* Attendance Controls Bar */}
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 shadow-none">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Date & Session Pickers */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShiftDate(-1)}
                      className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400"
                      title="Previous Day"
                    >
                      <ArrowLeftCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="h-8 text-xs font-mono w-36 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShiftDate(1)}
                      className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400"
                      title="Next Day"
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                    </Button>
                    {attDate !== todayStr && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttDate(todayStr)}
                        className="h-8 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      >
                        Today
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setAttSession("morning")}
                      className={`px-2.5 py-1 rounded ${attSession === "morning" ? "bg-white dark:bg-zinc-900 shadow-xs font-bold text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900"}`}
                    >
                      Morning Roll Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttSession("afternoon")}
                      className={`px-2.5 py-1 rounded ${attSession === "afternoon" ? "bg-white dark:bg-zinc-900 shadow-xs font-bold text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900"}`}
                    >
                      Afternoon Roll Call
                    </button>
                  </div>
                </div>

                {/* Sub-view switcher: Take vs History */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <div className="flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setAttSubView("take")}
                      className={`px-3 py-1 rounded font-medium ${attSubView === "take" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
                    >
                      Register Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttSubView("history")}
                      className={`px-3 py-1 rounded font-medium ${attSubView === "history" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs" : "text-zinc-500 hover:text-zinc-900"}`}
                    >
                      Monthly Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Status & Alerts Banner */}
              {attSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{attSuccessMsg}</span>
                  </div>
                  <button onClick={() => setAttSuccessMsg("")} className="text-emerald-600 hover:text-emerald-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {attData && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    {attData.isSubmitted ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 text-xs gap-1 py-0.5">
                        <Check className="h-3 w-3" />
                        Submitted ({attData.takenBy || "Teacher"})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-300 text-xs gap-1 py-0.5">
                        <Clock className="h-3 w-3" />
                        Draft / Not Submitted Yet
                      </Badge>
                    )}
                    {attData.updatedAt && (
                      <span className="text-[11px] text-zinc-400">
                        Last saved: {formatDateTime(attData.updatedAt)}
                      </span>
                    )}
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                      Total: {liveAttMetrics.total}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                      Present: {liveAttMetrics.present}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                      Absent: {liveAttMetrics.absent}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                      Late: {liveAttMetrics.late}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold">
                      Medical: {liveAttMetrics.medical}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold ml-1">
                      {liveAttMetrics.rate}% Present
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* VIEW A: TAKE REGISTER */}
          {attSubView === "take" && (
            <div className="space-y-4">
              {/* Quick Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Quick Actions:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("present")}
                    className="h-7 text-xs bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                  >
                    <Check className="h-3 w-3 mr-1 text-emerald-600" />
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("absent")}
                    className="h-7 text-xs bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                  >
                    Reset
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-56">
                    <Search className="absolute left-2.5 top-2 h-3 w-3 text-zinc-400" />
                    <Input
                      placeholder="Search student..."
                      value={attSearchTerm}
                      onChange={(e) => setAttSearchTerm(e.target.value)}
                      className="h-7 pl-7 text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <select
                    value={attStatusFilter}
                    onChange={(e) => setAttStatusFilter(e.target.value)}
                    className="h-7 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 outline-none px-2"
                  >
                    <option value="all">All</option>
                    <option value="present">Present Only</option>
                    <option value="absent">Absent Only</option>
                    <option value="late">Late Only</option>
                    <option value="medical">Medical Only</option>
                  </select>
                </div>
              </div>

              {/* Attendance Table */}
              <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none overflow-hidden">
                {loadingAtt ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    <p className="text-sm text-zinc-500">Loading {selectedClass} attendance register...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                          <TableHead className="w-10 text-xs font-semibold text-zinc-500">#</TableHead>
                          <TableHead className="w-24 text-xs font-semibold text-zinc-500">Adm No</TableHead>
                          <TableHead className="text-xs font-semibold text-zinc-500">Student Name</TableHead>
                          <TableHead className="w-28 text-xs font-semibold text-zinc-500">House</TableHead>
                          <TableHead className="text-center w-64 text-xs font-semibold text-zinc-500">Attendance Status</TableHead>
                          <TableHead className="w-48 text-xs font-semibold text-zinc-500">Remarks / Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttRoster.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-sm text-zinc-500">
                              No students found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAttRoster.map((student, idx) => {
                            const isPresent = student.status === "present";
                            const isAbsent = student.status === "absent";
                            const isLate = student.status === "late";
                            const isMedical = student.status === "medical";
                            const isExcused = student.status === "excused";

                            return (
                              <TableRow
                                key={student.admNo}
                                className={`border-b border-zinc-100 dark:border-zinc-800/60 transition-colors ${isAbsent ? "bg-rose-50/30 dark:bg-rose-950/10" : isMedical ? "bg-purple-50/30 dark:bg-purple-950/10" : ""}`}
                              >
                                <TableCell className="text-xs text-zinc-400 font-mono">{idx + 1}</TableCell>
                                <TableCell className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                  {student.admNo}
                                </TableCell>
                                <TableCell className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                  <div>
                                    <span className="font-semibold">{student.fullName}</span>
                                    {/* Sanatorium / Clinic Alert Badge */}
                                    {student.clinicVisitToday && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] py-0 px-1.5">
                                          At Sanatorium Today
                                        </Badge>
                                        {!isMedical && (
                                          <button
                                            type="button"
                                            onClick={() => handleMarkStudentStatus(student.admNo, "medical")}
                                            className="text-[10px] text-purple-600 underline font-medium hover:text-purple-800"
                                          >
                                            Set Medical
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {student.isHospitalReferred && (
                                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] py-0 px-1.5 mt-0.5 block w-fit">
                                        Referred to Hospital
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {student.house}
                                </TableCell>

                                {/* STATUS BUTTON GROUP */}
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleMarkStudentStatus(student.admNo, "present")}
                                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isPresent ? "bg-emerald-600 text-white shadow-xs" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                      title="Present"
                                    >
                                      P
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkStudentStatus(student.admNo, "absent")}
                                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isAbsent ? "bg-rose-600 text-white shadow-xs" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                      title="Absent"
                                    >
                                      A
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkStudentStatus(student.admNo, "late")}
                                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isLate ? "bg-amber-500 text-white shadow-xs" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                      title="Late"
                                    >
                                      L
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkStudentStatus(student.admNo, "medical")}
                                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isMedical ? "bg-purple-600 text-white shadow-xs" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                      title="Medical / Clinic"
                                    >
                                      M
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkStudentStatus(student.admNo, "excused")}
                                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isExcused ? "bg-blue-600 text-white shadow-xs" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                      title="Excused / Permitted"
                                    >
                                      E
                                    </button>
                                  </div>
                                </TableCell>

                                {/* REMARKS */}
                                <TableCell>
                                  <Input
                                    value={student.remarks || ""}
                                    onChange={(e) => handleStudentRemarkChange(student.admNo, e.target.value)}
                                    placeholder={isAbsent ? "Reason for absence..." : isMedical ? "At Clinic..." : "Note..."}
                                    className="h-7 text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-10 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Class: <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedClass}</span> | Date: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{attDate}</span> ({attSession.toUpperCase()})
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={savingAtt || loadingAtt || !attRoster.length}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 px-5 gap-1.5"
                  >
                    {savingAtt ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Register...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Attendance Register
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: ATTENDANCE HISTORY LOG */}
          {attSubView === "history" && (
            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-600" />
                  Monthly Attendance Records for Grade {selectedClass} ({attDate.slice(0, 7)})
                </CardTitle>
                <CardDescription className="text-xs">
                  Summary of submitted daily classroom roll calls.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingHist ? (
                  <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    <p className="text-sm text-zinc-500">Loading attendance history...</p>
                  </div>
                ) : attHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-8">
                    No attendance registers recorded for this month yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableHead className="text-xs font-semibold">Date</TableHead>
                        <TableHead className="text-xs font-semibold">Session</TableHead>
                        <TableHead className="text-xs font-semibold">Total Students</TableHead>
                        <TableHead className="text-xs font-semibold text-emerald-600">Present</TableHead>
                        <TableHead className="text-xs font-semibold text-rose-600">Absent</TableHead>
                        <TableHead className="text-xs font-semibold text-amber-600">Late</TableHead>
                        <TableHead className="text-xs font-semibold text-purple-600">Medical</TableHead>
                        <TableHead className="text-xs font-semibold">Attendance %</TableHead>
                        <TableHead className="text-xs font-semibold">Taken By</TableHead>
                        <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attHistory.map((h, i) => {
                        const total = Number(h.total_records) || 0;
                        const present = Number(h.present_count) || 0;
                        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                        const dateFormatted = h.date ? new Date(h.date).toISOString().split("T")[0] : "—";

                        return (
                          <TableRow key={i} className="border-b border-zinc-100 dark:border-zinc-800/60 text-xs">
                            <TableCell className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {dateFormatted}
                            </TableCell>
                            <TableCell className="capitalize">{h.session}</TableCell>
                            <TableCell className="font-mono">{total}</TableCell>
                            <TableCell className="font-mono font-bold text-emerald-600">{present}</TableCell>
                            <TableCell className="font-mono font-bold text-rose-600">{h.absent_count}</TableCell>
                            <TableCell className="font-mono font-bold text-amber-600">{h.late_count}</TableCell>
                            <TableCell className="font-mono font-bold text-purple-600">{h.medical_count}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs font-bold ${pct >= 90 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                                {pct}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400">{h.taken_by || "—"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAttDate(dateFormatted);
                                  setAttSession(h.session || "morning");
                                  setAttSubView("take");
                                }}
                                className="h-7 text-xs text-purple-600 hover:text-purple-800"
                              >
                                Open Register
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: CLASS ROSTER */}
        {/* ============================================================ */}
        <TabsContent value="roster" className="space-y-4 mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  placeholder="Filter by name, adm, house..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 text-xs rounded-md px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="all">All Status</option>
                <option value="visited_today">Visited Today</option>
                <option value="followup">Follow-up Due</option>
                <option value="hospital">Hospital Cases</option>
              </select>
            </div>
          </div>

          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableHead className="w-12 text-xs font-semibold text-zinc-500">#</TableHead>
                    <TableHead className="w-24 text-xs font-semibold text-zinc-500">Adm No</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Student Name</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">House</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Clinic Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-zinc-500">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoster.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-zinc-500">
                        No students match your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoster.map((student, idx) => {
                      const fullName = [student.fName, student.sName, student.tName, student.fourthName].filter(Boolean).join(" ");
                      return (
                        <TableRow
                          key={student.admNo}
                          onClick={() => handleStudentClick(student)}
                          className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60"
                        >
                          <TableCell className="text-xs text-zinc-400 font-mono">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {student.admNo}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {fullName}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                            {student.house || "—"}
                          </TableCell>
                          <TableCell>
                            {student.isReferred ? (
                              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900 text-[10px] font-semibold">
                                Referred to Hospital
                              </Badge>
                            ) : student.hasPendingFollowUp ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900 text-[10px] font-semibold">
                                Follow-up Due
                              </Badge>
                            ) : student.visitsTodayCount > 0 ? (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900 text-[10px] font-semibold">
                                Visited Clinic Today
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 text-[10px]">
                                In Class / Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              Details
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: RECENT CLINIC VISITS */}
        {/* ============================================================ */}
        <TabsContent value="visits" className="mt-0">
          <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableHead className="w-36 text-xs font-semibold text-zinc-500">Date & Time</TableHead>
                    <TableHead className="w-24 text-xs font-semibold text-zinc-500">Adm No</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Student</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Complaint / Symptoms</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Diagnosed Ailment</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-500">Medication</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!classData?.recentVisits?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-zinc-500">
                        No clinic visits recorded for this class this week.
                      </TableCell>
                    </TableRow>
                  ) : (
                    classData.recentVisits.map((v, i) => (
                      <TableRow key={i} className="border-b border-zinc-100 dark:border-zinc-800/60">
                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                          {formatDateTime(v.timestamp)}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {v.admNo}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {v.fName} {v.sName}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                          {v.complain || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {v.ailment || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                          {v.medication || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 4: ALERTS & REFERRALS */}
        {/* ============================================================ */}
        <TabsContent value="alerts" className="mt-0">
          <div className="space-y-4">
            {classData?.metrics?.referredToHospital > 0 && (
              <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Students Referred to Outside Hospital ({classData.metrics.referredToHospital})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {classData.roster.filter(s => s.isReferred).map(s => (
                    <div key={s.admNo} className="p-2.5 bg-white dark:bg-zinc-900 rounded border border-rose-200 dark:border-rose-900 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold">{s.fName} {s.sName}</span> (Adm: {s.admNo}, House: {s.house || "—"})
                        <p className="text-[11px] text-zinc-500">Reason: {s.ailment || s.complain || "Urgent medical referral"}</p>
                      </div>
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">Referred</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-amber-500" />
                  Pending Sanatorium Follow-up Appointments ({classData?.pendingFollowUps?.length || 0})
                </CardTitle>
                <CardDescription className="text-xs">
                  Students due to return to the sanatorium for re-checks or medication reviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {!classData?.pendingFollowUps?.length ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">
                    No pending follow-up appointments scheduled for this class.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {classData.pendingFollowUps.map((f) => (
                      <div key={f.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            Student Adm: {f.adm_no}
                          </p>
                          <p className="text-zinc-500 dark:text-zinc-400">
                            Reason: {f.reason || "Clinical Follow-up"}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Scheduled: {formatDateTime(f.scheduled_time)}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending Return
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Student Health Detail Modal */}
      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              Student Health Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Overview of clinic logs and current status.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {[selectedStudent.fName, selectedStudent.sName, selectedStudent.tName, selectedStudent.fourthName].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Adm No: {selectedStudent.admNo} | Class: {selectedStudent.class} | House: {selectedStudent.house || "—"}
                    </p>
                  </div>
                  <div>
                    {selectedStudent.isReferred ? (
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-[10px]">
                        Referred
                      </Badge>
                    ) : selectedStudent.hasPendingFollowUp ? (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px]">
                        Follow-up Due
                      </Badge>
                    ) : selectedStudent.visitsTodayCount > 0 ? (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-[10px]">
                        Visited Today
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Normal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {selectedStudent.followUps?.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-900 space-y-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Scheduled Return Date
                  </p>
                  {selectedStudent.followUps.map(f => (
                    <p key={f.id} className="text-zinc-700 dark:text-zinc-300">
                      {formatDateTime(f.scheduled_time)} — {f.reason || "Follow-up check"}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  Recent Clinic Visits (This Week)
                </p>
                {!selectedStudent.visits?.length ? (
                  <p className="text-zinc-500 text-[11px] py-2">
                    No recent clinical records found for this week.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedStudent.visits.map((v, i) => (
                      <div key={i} className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                          <span>{formatDateTime(v.timestamp)}</span>
                          <span>Temp: {v.tempReading ? v.tempReading + "°C" : "—"}</span>
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-200">
                          <span className="font-semibold">Symptoms:</span> {v.complain || "None stated"}
                        </p>
                        <p className="text-zinc-800 dark:text-zinc-200">
                          <span className="font-semibold">Ailment:</span> {v.ailment || "General checkup"}
                        </p>
                        {v.medication && (
                          <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                            <span className="font-semibold font-sans">Rx:</span> {v.medication}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
