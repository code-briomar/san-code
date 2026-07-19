"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { devMode } from "@/lib/dev_mode";
import { useFormik } from "formik";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRightFromSquare,
  Clock,
  LucideLoader,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import {
  fetchStudentData,
  fetchStudentHistory,
} from "./services";
import { fetchTodayStats } from "@/app/services";
import StudentProfileModal from "./components/StudentProfileModal";
import LoadingModal from "./components/LoadingModal";
import Dashboard from "./components/Dashboard";

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading states
  const [searchLoading, setSearchLoading] = useState(false);
  const [autoSearchLoading, setAutoSearchLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Data states
  const [studentData, setStudentData] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [todayStats, setTodayStats] = useState(null);

  // Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Load recent patients from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentPatients");
      if (stored) {
        setRecentPatients(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading recent patients:", e);
    }
  }, []);

  // Load today's stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      const stats = await fetchTodayStats();
      setTodayStats(stats);
      setStatsLoading(false);
    };
    loadStats();
  }, []);

  // Save recent patient to localStorage
  const saveRecentPatient = useCallback((student) => {
    if (!student?.admNo) return;

    try {
      const stored = localStorage.getItem("recentPatients");
      let recent = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      recent = recent.filter((p) => p.admNo !== student.admNo);

      // Add to beginning
      recent.unshift({
        admNo: student.admNo,
        fName: student.fName,
        sName: student.sName,
        class: student.class,
      });

      // Keep only last 5
      recent = recent.slice(0, 5);

      localStorage.setItem("recentPatients", JSON.stringify(recent));
      setRecentPatients(recent);
    } catch (e) {
      console.error("Error saving recent patient:", e);
    }
  }, []);

  // Search function
  const performSearch = useCallback(
    async (admissionNumber, isAutoSearch = false) => {
      if (isAutoSearch) {
        setAutoSearchLoading(true);
      } else {
        setSearchLoading(true);
      }

      const student_data = await fetchStudentData(admissionNumber);
      const student_history_data = await fetchStudentHistory(admissionNumber);

      if (student_data == null) {
        toast.error("Student not found");
        setSearchLoading(false);
        setAutoSearchLoading(false);
        return;
      }

      if (devMode) console.log(student_data);

      // Save to recent patients
      saveRecentPatient(student_data);

      setStudentData(student_data);
      setStudentHistory(student_history_data || []);
      setProfileModalOpen(true);
      setSearchLoading(false);
      setAutoSearchLoading(false);
    },
    [saveRecentPatient]
  );

  // Handle URL params for auto-search (from redirect after save)
  useEffect(() => {
    const admissionNumber = searchParams.get("admission_number");
    const saved = searchParams.get("saved");

    if (admissionNumber) {
      // Show success message if redirected from a save action
      if (saved === "new") {
        toast.success("New record created successfully!");
      } else if (saved === "update") {
        toast.success("Record updated successfully!");
      }

      // Auto-trigger search with loading modal
      performSearch(admissionNumber, true);

      // Clear URL params without reload
      router.replace("/students");
    }
  }, [searchParams, performSearch]);

  // Form handling
  const formik = useFormik({
    initialValues: {
      admission_number: "",
    },
    validationSchema: Yup.object({
      admission_number: Yup.string().required("Required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      await performSearch(values.admission_number);
      formikHelpers.resetForm();
    },
  });

  // Enter key handler
  const handleKeyPressed = (e) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  // Close profile modal
  const handleCloseProfile = () => {
    setProfileModalOpen(false);
    setStudentData(null);
    setStudentHistory([]);
  };

  return (
    <>
      {/* Loading Modal - Non-cancellable */}
      <LoadingModal
        open={autoSearchLoading}
        message="Loading student profile..."
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        open={profileModalOpen && !autoSearchLoading}
        onClose={handleCloseProfile}
        studentData={studentData}
        studentHistory={studentHistory}
        onStudentUpdate={(updatedData) => setStudentData(updatedData)}
      />

      <div className="min-h-screen flex flex-col">
        {/* Compact Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black no-print">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/")}
                className="w-8 h-8 rounded-full shadow-sm hover:scale-105 transition-transform border-zinc-300 dark:border-zinc-850"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">Students</h1>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
                <Link
                  href="/"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/students/student-create-entry"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Add New Student
                </Link>
                <Link
                  href="/students/none_busherian"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Non-Busherian
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <Link
                href="/view_summary"
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1 hover:underline underline-offset-4"
              >
                <span>Summary</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl">
            {/* Hero Search */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Search Student
              </h2>
              <p className="text-slate-500 dark:text-slate-450 text-xs">
                Enter admission number to view or update records
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                name="admission_number"
                value={formik.values.admission_number}
                type="text"
                autoComplete="off"
                autoFocus
                placeholder="e.g. 13256"
                className="flex-1 h-14 text-xl font-mono text-center bg-white dark:bg-black border-2 border-zinc-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-slate-100"
                onChange={formik.handleChange}
                onKeyDown={handleKeyPressed}
                disabled={searchLoading}
              />
              <Button
                className="h-14 px-8 text-base"
                type="submit"
                onClick={formik.handleSubmit}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <LucideLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Recent Searches */}
            {recentPatients.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Recent:</span>
                <div className="flex flex-wrap gap-1">
                  {recentPatients.map((patient) => (
                    <button
                      key={patient.admNo}
                      onClick={() => performSearch(patient.admNo)}
                      disabled={searchLoading}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                    >
                      {patient.admNo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Stats Bar - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Dashboard stats={todayStats} onPatientClick={performSearch} loading={statsLoading} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Students() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LucideLoader className="w-8 h-8 animate-spin" /></div>}>
      <StudentsContent />
    </Suspense>
  );
}
