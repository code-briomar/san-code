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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import {
  fetchStaffMemberData,
  fetchStaffHistory,
  createNewStaffRecord,
  fetchStaffStats,
} from "./services";
import StaffProfileModal from "./components/StaffProfileModal";
import LoadingModal from "./components/LoadingModal";
import Dashboard from "./components/Dashboard";

function StaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Loading states
  const [searchLoading, setSearchLoading] = useState(false);
  const [autoSearchLoading, setAutoSearchLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Data states
  const [staffData, setStaffData] = useState(null);
  const [staffHistory, setStaffHistory] = useState([]);
  const [recentStaff, setRecentStaff] = useState([]);
  const [staffStats, setStaffStats] = useState(null);

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addNewStaffRecord, setAddNewStaffRecord] = useState(false);
  const [pendingIdNo, setPendingIdNo] = useState(null);

  // Load recent staff from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentStaff");
      if (stored) {
        setRecentStaff(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading recent staff:", e);
    }
  }, []);

  // Load staff stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      const stats = await fetchStaffStats();
      setStaffStats(stats);
      setStatsLoading(false);
    };
    loadStats();
  }, []);

  // Save recent staff to localStorage
  const saveRecentStaff = useCallback((staff) => {
    if (!staff?.idNo) return;

    try {
      const stored = localStorage.getItem("recentStaff");
      let recent = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      recent = recent.filter((s) => s.idNo !== staff.idNo);

      // Add to beginning
      recent.unshift({
        idNo: staff.idNo,
        fName: staff.fName,
        sName: staff.sName,
      });

      // Keep only last 5
      recent = recent.slice(0, 5);

      localStorage.setItem("recentStaff", JSON.stringify(recent));
      setRecentStaff(recent);
    } catch (e) {
      console.error("Error saving recent staff:", e);
    }
  }, []);

  // Search function
  const performSearch = useCallback(
    async (idNumber, isAutoSearch = false) => {
      if (isAutoSearch) {
        setAutoSearchLoading(true);
      } else {
        setSearchLoading(true);
      }

      const staff_data = await fetchStaffMemberData(idNumber);
      const staff_history_data = await fetchStaffHistory(idNumber);

      if (staff_data == null) {
        toast("Staff member not found. Add their record to the system?", {
          action: {
            label: "Yes",
            onClick: async () => {
              setPendingIdNo(idNumber);
              setAddNewStaffRecord(true);
            },
          },
          cancel: {
            label: "No",
            onClick: () => {},
          },
          duration: 600000,
        });
        setSearchLoading(false);
        setAutoSearchLoading(false);
        return;
      }

      if (devMode) console.log(staff_data);

      // Save to recent staff
      saveRecentStaff(staff_data);

      setStaffData(staff_data);
      setStaffHistory(staff_history_data || []);
      setProfileModalOpen(true);
      setSearchLoading(false);
      setAutoSearchLoading(false);
    },
    [saveRecentStaff]
  );

  // Handle URL params for auto-search (from redirect after save)
  useEffect(() => {
    const idNumber = searchParams.get("id_number");
    const saved = searchParams.get("saved");

    if (idNumber) {
      // Show success message if redirected from a save action
      if (saved === "new") {
        toast.success("New record created successfully!");
      } else if (saved === "update") {
        toast.success("Record updated successfully!");
      }

      // Auto-trigger search with loading modal
      performSearch(idNumber, true);

      // Clear URL params without reload
      router.replace("/staff");
    }
  }, [searchParams, performSearch]);

  // Form handling for search
  const formik = useFormik({
    initialValues: {
      id_number: "",
    },
    validationSchema: Yup.object({
      id_number: Yup.string().required("Required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      await performSearch(values.id_number);
      formikHelpers.resetForm();
    },
  });

  // Form handling for new staff record
  const formikNewStaff = useFormik({
    enableReinitialize: true,
    initialValues: {
      id_number: pendingIdNo || "",
      fName: "",
      sName: "",
    },
    validationSchema: Yup.object({
      fName: Yup.string().required("First name is required"),
      sName: Yup.string().required("Second name is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      setSearchLoading(true);
      const result = await createNewStaffRecord(
        values.id_number,
        values.fName,
        values.sName
      );

      if (result?.status === null || result?.status === undefined) {
        toast.error("Problem adding staff member. Please try again.");
        setSearchLoading(false);
        return;
      }

      toast.success("Staff member has been added to the system.");
      setSearchLoading(false);
      setAddNewStaffRecord(false);
      setPendingIdNo(null);
      formikHelpers.resetForm();

      // Search for the newly added staff member
      performSearch(values.id_number);
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
    setStaffData(null);
    setStaffHistory([]);
  };

  // Close add new staff form
  const handleCancelAddStaff = () => {
    setAddNewStaffRecord(false);
    setPendingIdNo(null);
    formikNewStaff.resetForm();
  };

  return (
    <>
      {/* Loading Modal - Non-cancellable */}
      <LoadingModal
        open={autoSearchLoading}
        message="Loading staff profile..."
      />

      {/* Staff Profile Modal */}
      <StaffProfileModal
        open={profileModalOpen && !autoSearchLoading}
        onClose={handleCloseProfile}
        staffData={staffData}
        staffHistory={staffHistory}
      />

      <div className="min-h-screen flex flex-col">
        {/* Compact Header */}
        <header className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="font-mono font-bold text-lg">Staff</h1>
              <nav className="hidden sm:flex items-center gap-4 text-sm">
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">
                  Home
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/view_summary"
                target="_blank"
                className="text-gray-500 hover:text-blue-500 flex items-center gap-1"
              >
                Summary
                <ArrowUpRightFromSquare className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl">
            {/* Add New Staff Form */}
            {addNewStaffRecord ? (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Add New Staff Member
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID Number
                    </label>
                    <Input
                      name="id_number"
                      value={formikNewStaff.values.id_number}
                      disabled
                      className="bg-gray-50 dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <Input
                      name="fName"
                      value={formikNewStaff.values.fName}
                      onChange={formikNewStaff.handleChange}
                      placeholder="e.g Alex"
                      autoFocus
                    />
                    {formikNewStaff.errors.fName && formikNewStaff.touched.fName && (
                      <p className="text-sm text-rose-500 mt-1">{formikNewStaff.errors.fName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Second Name
                    </label>
                    <Input
                      name="sName"
                      value={formikNewStaff.values.sName}
                      onChange={formikNewStaff.handleChange}
                      placeholder="e.g Tobiko"
                    />
                    {formikNewStaff.errors.sName && formikNewStaff.touched.sName && (
                      <p className="text-sm text-rose-500 mt-1">{formikNewStaff.errors.sName}</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={formikNewStaff.handleSubmit}
                      disabled={searchLoading}
                      className="flex-1"
                    >
                      {searchLoading ? (
                        <LucideLoader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Add Staff</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelAddStaff}
                      disabled={searchLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Hero Search */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Search Staff
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Enter ID number to view or update records
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    name="id_number"
                    value={formik.values.id_number}
                    type="text"
                    autoComplete="off"
                    autoFocus
                    placeholder="e.g 42073535"
                    className="flex-1 h-14 text-xl font-mono text-center bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 dark:focus-visible:border-blue-500"
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
                {recentStaff.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Recent:</span>
                    <div className="flex flex-wrap gap-1">
                      {recentStaff.map((staff) => (
                        <button
                          key={staff.idNo}
                          onClick={() => performSearch(staff.idNo)}
                          disabled={searchLoading}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                        >
                          {staff.idNo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Stats Bar - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Dashboard stats={staffStats} onStaffClick={performSearch} loading={statsLoading} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Staff() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LucideLoader className="w-8 h-8 animate-spin" /></div>}>
      <StaffContent />
    </Suspense>
  );
}
