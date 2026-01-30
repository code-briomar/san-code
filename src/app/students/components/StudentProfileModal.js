"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ArrowRight,
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

export default function StudentProfileModal({
  open,
  onClose,
  studentData,
  studentHistory,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [directingTo, setDirectingTo] = useState(null);

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
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header - Identity */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
            {studentData?.admNo}
          </p>
          <h2 className="text-xl font-semibold mt-1">
            {studentData?.fName} {studentData?.sName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Class {studentData?.class}
          </p>
        </div>

        {/* Status Cards */}
        <div className="p-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="grid grid-cols-3 gap-3">
            {/* Temperature */}
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
              <Thermometer className={`w-5 h-5 mx-auto mb-1 ${
                studentData?.tempReading > 37
                  ? "text-rose-500"
                  : "text-green-500"
              }`} />
              <p className={`text-lg font-bold ${
                studentData?.tempReading > 37
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-green-600 dark:text-green-400"
              }`}>
                {studentData?.tempReading}°C
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
            </div>

            {/* Medication */}
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
              <Pill className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                {studentData?.medication || "-"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Medication</p>
            </div>

            {/* Ailment */}
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
              <Stethoscope className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                {studentData?.ailment || "-"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ailment</p>
            </div>
          </div>

          {/* Supporting Info */}
          <div className="mt-4 space-y-1">
            {studentData?.complain && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">Complains:</span>{" "}
                {studentData.complain}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              On medication for {daysOnMedication} {daysOnMedication === 1 ? "day" : "days"} · Last took meds {getTimeOfDay(studentData?.timestamp)}
            </p>
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
              <a
                href={`/students/student-update-entry/?admission_number=${studentData?.admNo}`}
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </a>
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
      </DialogContent>
    </Dialog>
  );
}
