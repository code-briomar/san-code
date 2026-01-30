"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { devMode } from "@/lib/dev_mode";
import { useFormik } from "formik";
import {
  ArrowRight,
  ArrowUpRightFromSquare,
  Clock,
  LucideLoader,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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

export default function Students() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading states
  const [searchLoading, setSearchLoading] = useState(false);
  const [autoSearchLoading, setAutoSearchLoading] = useState(false);

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
      const stats = await fetchTodayStats();
      setTodayStats(stats);
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
      window.history.replaceState({}, "", "/students");
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
      />

      <main className="flex min-h-screen flex-col items-center p-4 md:p-10">
        {/* Title bar */}
        <div className="z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex lg:justify-between mb-6">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            <code className="font-mono font-bold">&nbsp;Students</code>
          </p>

          <div className="hidden lg:flex lg:space-x-5 lg:ml-10 lg:mt-2">
            <a
              href="/"
              className="text-blue-500 underline font-semibold text-base"
            >
              Home
            </a>
            <a
              href="/students/student-create-entry"
              className="text-blue-500 underline font-semibold text-base"
            >
              Add New Student
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-2xl mt-16 lg:mt-0">
          {/* Dashboard - Alerts & Stats */}
          <Dashboard stats={todayStats} onPatientClick={performSearch} />

          {/* Search Section */}
          <div className="border border-gray-300 dark:border-neutral-700 rounded-xl p-4 md:p-6 bg-white dark:bg-zinc-800/30">
            <label className="font-semibold text-sm block mb-3">
              Search by admission number
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                name="admission_number"
                value={formik.values.admission_number}
                type="text"
                autoComplete="off"
                autoFocus
                placeholder="e.g 13256"
                className="flex-1 h-12 text-lg font-mono bg-white dark:bg-zinc-900 border-gray-300 dark:border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400 dark:focus-visible:border-neutral-500"
                onChange={formik.handleChange}
                onKeyDown={handleKeyPressed}
                disabled={searchLoading}
              />
              <Button
                variant="outline"
                className="h-12 px-6 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
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
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Recent:</span>
                <div className="flex flex-wrap gap-1">
                  {recentPatients.map((patient) => (
                    <button
                      key={patient.admNo}
                      onClick={() => performSearch(patient.admNo)}
                      disabled={searchLoading}
                      className="px-2 py-0.5 text-xs border border-gray-200 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {patient.admNo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links - Tertiary */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <a
              href="/view_summary"
              target="_blank"
              className="text-gray-500 hover:text-blue-500 hover:underline flex items-center gap-1"
            >
              View Summary
              <ArrowUpRightFromSquare className="w-3 h-3" />
            </a>

            <a
              href="/students/non_busherian"
              target="_blank"
              className="text-gray-500 hover:text-blue-500 hover:underline flex items-center gap-1"
            >
              Non-Busherian
              <ArrowUpRightFromSquare className="w-3 h-3" />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
