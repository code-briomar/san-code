"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  GraduationCap,
  Loader,
  Pencil,
  Plus,
  Repeat,
  Thermometer,
  Pill,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MissingInfoBanner from "./MissingInfoBanner";
import ProfileUpdateModal from "./ProfileUpdateModal";

export default function StudentProfileModal({
  open,
  onClose,
  studentData,
  studentHistory,
  onStudentUpdate,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [directingTo, setDirectingTo] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const directToPage = (link, target) => {
    setDirectingTo(target);
    setLoading(true);
    setTimeout(() => {
      router.push(`${link}?admission_number=${studentData?.admNo}`);
      setLoading(false);
    }, 500);
  };

  const handleRepeatVisit = () => {
    setDirectingTo("repeat_visit");
    setLoading(true);
    setTimeout(() => {
      router.push(
        `/students/new_record?admission_number=${studentData?.admNo}&prefill=true`
      );
      setLoading(false);
    }, 500);
  };

  if (!studentData) return null;

  const getTimeOfDay = (timestamp) => {
    const hour = new Date(timestamp).getHours();
    if (hour >= 5 && hour < 12) return "this morning";
    if (hour >= 12 && hour < 17) return "at lunch";
    if (hour >= 17 && hour < 19) return "this evening";
    return "tonight";
  };

  const daysOnMedication =
    new Date().getDate() - new Date(studentData?.timestamp).getDate() + 1;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">
          Student Profile - {studentData?.fName} {studentData?.sName}
        </DialogTitle>
        {/* Header - Identity */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
            {studentData?.admNo}
          </p>
          <p className="text-xl font-semibold mt-1">
            {studentData?.fName} {studentData?.sName}
          </p>
          {studentData?.graduationYear ? (
            <div className="mt-1 flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                <GraduationCap className="w-4 h-4" />
                Graduated {studentData.graduationYear}
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
              >
                Not correct?
              </button>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Class {studentData?.class}
              {studentData?.house && (
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  · {studentData.house}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Content for ACTIVE students */}
        {!studentData?.graduationYear && (
          <>
            {/* Missing Info Banner */}
            {!studentData?.house && (
              <div className="mt-2">
                <MissingInfoBanner
                  missingFields={["House"]}
                  onAddClick={() => setProfileModalOpen(true)}
                />
              </div>
            )}

            {/* Status Cards */}
            <div className="p-6 py-4 border-b border-gray-100 dark:border-neutral-800">
              {/* Temperature - inline */}
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className={`w-5 h-5 ${
                  studentData?.tempReading > 37
                    ? "text-rose-500"
                    : "text-green-500"
                }`} />
                <span className={`text-lg font-bold ${
                  studentData?.tempReading > 37
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {studentData?.tempReading}°C
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
              </div>

              {/* Ailment */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ailment</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 pl-6">
                  {studentData?.ailment || "-"}
                </p>
              </div>

              {/* Medication */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Medication</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 pl-6">
                  {studentData?.medication || "-"}
                </p>
              </div>

              {/* Supporting Info */}
              <div className="mt-4 space-y-2">
                {studentData?.complain && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Complains:</span>{" "}
                    {studentData.complain}
                  </p>
                )}
                
                {studentData?.medicationTiming && studentData.medicationTiming.status !== "NONE" ? (
                  <div className="text-xs space-y-1 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <p className="text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold text-slate-800 dark:text-zinc-300">Last Taken:</span> {studentData.medicationTiming.lastTakenText}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold text-slate-800 dark:text-zinc-300">Next Dose:</span>{" "}
                      <span className={
                        studentData.medicationTiming.status === "OVERDUE" 
                          ? "text-rose-500 font-bold" 
                          : studentData.medicationTiming.status === "DUE" 
                            ? "text-amber-500 font-bold" 
                            : "text-green-600 dark:text-green-400 font-semibold"
                      }>
                        {studentData.medicationTiming.nextDueText}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    On medication for {daysOnMedication} {daysOnMedication === 1 ? "day" : "days"} · Last took meds {getTimeOfDay(studentData?.timestamp)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 py-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => directToPage("/students/new_record", "new_record")}
                  disabled={loading}
                >
                  {loading && directingTo === "new_record" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  New Record
                </Button>

                {studentData?.ailment && studentData?.medication && (
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={handleRepeatVisit}
                    disabled={loading}
                  >
                    {loading && directingTo === "repeat_visit" ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Repeat className="w-4 h-4 mr-2" />
                    )}
                    Repeat Visit
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => directToPage("/students/update_record", "update_record")}
                  disabled={loading}
                >
                  {loading && directingTo === "update_record" ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* History */}
            <div className="p-6 pt-4 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                  History
                </h3>
                {studentHistory?.length > 3 && (
                  <Link
                    href={`/students/history?admission_number=${studentData?.admNo}`}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {studentHistory?.length > 0 ? (
                <div className="space-y-2">
                  {studentHistory.slice(0, 5).map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm py-2 border-b border-gray-100 dark:border-neutral-800 last:border-0"
                    >
                      <span className="text-gray-400 dark:text-gray-500 w-14 flex-shrink-0">
                        {formatDate(record.timestamp)}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {record.ailment || record.complain || "-"}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 truncate">
                        {record.medication || "-"}
                      </span>
                      <span className={`ml-auto flex-shrink-0 ${
                        record.tempreading > 37
                          ? "text-rose-500"
                          : "text-gray-400 dark:text-gray-500"
                      }`}>
                        {record.tempreading}°
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  No history available
                </p>
              )}
            </div>
          </>
        )}

        {/* Content for GRADUATED students - just a History button */}
        {studentData?.graduationYear && (
          <div className="p-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/students/history?admission_number=${studentData?.admNo}`)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              View Medical History
            </Button>
          </div>
        )}

        {/* Profile Update Modal */}
        <ProfileUpdateModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          studentData={studentData}
          onSuccess={(updatedData) => {
            onStudentUpdate?.(updatedData);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
