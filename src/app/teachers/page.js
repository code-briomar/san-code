"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldAlert,
  Key,
  Search,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  School
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { verifyStudentClinicStatus } from "./services";
import ClassTeacherDashboard from "./components/ClassTeacherDashboard";

export default function TeacherPortal() {
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [portalTab, setPortalTab] = useState("class_dashboard"); // "class_dashboard" | "student_lookup"

  const [searchAdm, setSearchAdm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Results for student lookup
  const [studentInfo, setStudentInfo] = useState(null);
  const [latestVisits, setLatestVisits] = useState([]);
  const [scheduledReturns, setScheduledReturns] = useState([]);
  const [searched, setSearched] = useState(false);

  // Load passcode verification session from local/session storage
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("teacher_auth_unlocked");
    const savedPasscode = sessionStorage.getItem("teacher_passcode");
    if (sessionAuth === "true" && savedPasscode) {
      setIsUnlocked(true);
      setPasscode(savedPasscode);
    }
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg("Please enter the teacher access passcode.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    // Store passcode session
    sessionStorage.setItem("teacher_auth_unlocked", "true");
    sessionStorage.setItem("teacher_passcode", passcode);
    setIsUnlocked(true);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchAdm) {
      setErrorMsg("Please enter a student admission number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setStudentInfo(null);
    setLatestVisits([]);
    setScheduledReturns([]);
    setSearched(false);

    try {
      const data = await verifyStudentClinicStatus(searchAdm, passcode);
      if (data.status === "success") {
        setStudentInfo(data.studentInfo);
        setLatestVisits(data.latestVisits || []);
        setScheduledReturns(data.scheduledReturns || []);
        setSearched(true);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMsg("Access Denied: Incorrect passcode. Please sign out and try again.");
        setIsUnlocked(false);
        sessionStorage.removeItem("teacher_auth_unlocked");
      } else {
        setErrorMsg(err.response?.data?.error || "Failed to lookup student. Check admission number.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("teacher_auth_unlocked");
    sessionStorage.removeItem("teacher_passcode");
    setIsUnlocked(false);
    setPasscode("");
    setSearchAdm("");
    setStudentInfo(null);
    setLatestVisits([]);
    setScheduledReturns([]);
    setSearched(false);
    setErrorMsg("");
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp);
    return d.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 py-8 px-4 md:px-8">
      <div className={cn("mx-auto space-y-6 transition-all duration-300", isUnlocked && portalTab === "class_dashboard" ? "max-w-5xl" : "max-w-2xl")}>

        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                sanCode Teacher Portal
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Class health rosters, clinical logs & verification
              </p>
            </div>
          </div>
          {isUnlocked && (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs h-8">
              Sign Out
            </Button>
          )}
        </header>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Passcode Unlock Screen */}
        {!isUnlocked && (
          <Card className="max-w-md mx-auto bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-2">
                <Key className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <CardTitle className="text-zinc-900 dark:text-zinc-100">Staff Authorization</CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400">
                Please enter the staff passcode to access class rosters and student verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnlock} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter staff passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="text-center font-mono tracking-widest bg-white border-zinc-200 text-zinc-900 focus-visible:ring-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-700"
                  required
                />
                <Button type="submit" disabled={loading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-medium">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Portal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Main Portal View (Unlocked) */}
        {isUnlocked && (
          <div className="space-y-6">
            {/* Top Navigation Switcher */}
            <div className="flex items-center justify-center sm:justify-start">
              <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPortalTab("class_dashboard")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                    portalTab === "class_dashboard"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  <School className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  My Class Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setPortalTab("student_lookup")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                    portalTab === "student_lookup"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Student Lookup & Verification
                </button>
              </div>
            </div>

            {/* TAB 1: CLASS TEACHER DASHBOARD */}
            {portalTab === "class_dashboard" && (
              <ClassTeacherDashboard passcode={passcode} />
            )}

            {/* TAB 2: INDIVIDUAL STUDENT LOOKUP */}
            {portalTab === "student_lookup" && (
              <div className="space-y-6">
                {/* Search Card */}
                <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Verify Student Status</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Lookup a student to check their last visit time and clinic release status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-3">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Enter Student Admission Number..."
                          type="number"
                          value={searchAdm}
                          onChange={(e) => setSearchAdm(e.target.value)}
                          disabled={loading}
                          required
                          className="pl-9 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus-visible:ring-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <Button type="submit" disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-medium">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Results Output */}
                {searched && studentInfo && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Status Summary Panel */}
                    <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none overflow-hidden">
                      <div className="bg-zinc-100 border-b border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{studentInfo.fName} {studentInfo.sName}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Class: {studentInfo.class} | Admission Number: {studentInfo.admNo}
                          </p>
                        </div>
                        <UserCheck className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" /> Last Sanatorium Visit
                            </span>
                            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                              {formatDateTime(studentInfo.lastStatusTime)}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" /> Release Status
                            </span>
                            <div>
                              {studentInfo.going_to_hospital === 1 ? (
                                <Badge variant="outline" className="border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-700 dark:text-rose-200 dark:bg-rose-950/40 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                  Referred to Hospital
                                </Badge>
                              ) : (
                                <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs px-2.5 py-0.5 rounded-full font-medium border border-transparent">
                                  Cleared Back to Class
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {scheduledReturns.length > 0 ? (
                          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 space-y-1.5">
                            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-200">
                              <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                              <span>Active Nurse Return Schedule</span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Student has been instructed to return to the sanatorium on:
                            </p>
                            <div className="font-semibold text-sm font-mono mt-1 text-zinc-800 dark:text-zinc-100">
                              {formatDateTime(scheduledReturns[0].scheduled_time)}
                            </div>
                            <p className="text-[11px] text-zinc-500 italic mt-1">
                              Reason: {scheduledReturns[0].reason || "General review/dressing"}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                            No pending return schedules registered. Student is fully cleared for classes.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Short Clinical Timeline */}
                    <Card className="bg-white border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Clinic Visits Timeline</CardTitle>
                        <CardDescription className="text-zinc-500 dark:text-zinc-400">Verify historical logs to confirm if the student visited before.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {latestVisits.length === 0 ? (
                          <p className="text-sm text-zinc-500 text-center py-4">No visit logs found.</p>
                        ) : (
                          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
                            {latestVisits.map((visit, idx) => (
                              <div key={idx} className="relative pl-8 flex gap-3 items-start text-sm">
                                <div className="absolute left-[9px] top-[5px] h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-black" />
                                <div className="flex-1 space-y-1 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                                  <div className="flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500">
                                    <span className="font-semibold">{formatDateTime(visit.timestamp)}</span>
                                    {visit.going_to_hospital === 1 ? (
                                      <span className="text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900 px-1.5 py-0.5 rounded text-[10px] bg-rose-50 dark:bg-rose-950/50">Hospital Referral</span>
                                    ) : (
                                      <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Clinic Managed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {searched && !studentInfo && (
                  <p className="text-center text-zinc-500 py-6">No details found for this student.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
