"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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

export default function StaffProfileModal({
  open,
  onClose,
  staffData,
  staffHistory,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [directingTo, setDirectingTo] = useState(null);

  const directToPage = (link, target) => {
    setDirectingTo(target);
    setLoading(true);
    setTimeout(() => {
      router.push(`${link}?id_number=${staffData?.idNo}`);
      setLoading(false);
    }, 500);
  };

  const handleRepeatVisit = () => {
    setDirectingTo("repeat_visit");
    setLoading(true);
    setTimeout(() => {
      router.push(
        `/staff/new_record?id_number=${staffData?.idNo}&prefill=true`
      );
      setLoading(false);
    }, 500);
  };

  if (!staffData) return null;

  const getTimeOfDay = (timestamp) => {
    const hour = new Date(timestamp).getHours();
    if (hour >= 5 && hour < 12) return "this morning";
    if (hour >= 12 && hour < 17) return "at lunch";
    if (hour >= 17 && hour < 19) return "this evening";
    return "tonight";
  };

  const getDaysOnMedication = (timestamp) => {
    if (!timestamp) return 1;
    const startDate = new Date(timestamp);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays >= 1 ? diffDays : 1;
  };

  const daysOnMedication = getDaysOnMedication(staffData?.timestamp);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">
          Staff Profile - {staffData?.fName} {staffData?.sName}
        </DialogTitle>
        {/* Header - Identity */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
            {staffData?.idNo}
          </p>
          <p className="text-xl font-semibold mt-1">
            {staffData?.fName} {staffData?.sName}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Staff Member
          </p>
        </div>

        {/* Status Cards */}
        <div className="p-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          {/* Temperature - inline */}
          {staffData?.tempReading && (
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className={`w-5 h-5 ${
                staffData?.tempReading > 37
                  ? "text-rose-500"
                  : "text-green-500"
              }`} />
              <span className={`text-lg font-bold ${
                staffData?.tempReading > 37
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-green-600 dark:text-green-400"
              }`}>
                {staffData?.tempReading}°C
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
            </div>
          )}

          {/* Ailment */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ailment</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 pl-6">
              {staffData?.ailment || "-"}
            </p>
          </div>

          {/* Medication */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pill className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Medication</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 pl-6">
              {staffData?.medication || "-"}
            </p>
          </div>

          {/* Supporting Info */}
          <div className="mt-4 space-y-1">
            {staffData?.complain && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">Complains:</span>{" "}
                {staffData.complain}
              </p>
            )}
            {staffData?.timestamp && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                On medication for {daysOnMedication} {daysOnMedication === 1 ? "day" : "days"} · Last took meds {getTimeOfDay(staffData?.timestamp)}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => directToPage("/staff/new_record", "new_record")}
              disabled={loading}
            >
              {loading && directingTo === "new_record" ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Record
            </Button>

            {staffData?.ailment && staffData?.medication && (
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
              onClick={() => directToPage("/staff/update_record", "update_record")}
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
          </div>

          {staffHistory?.length > 0 ? (
            <div className="space-y-2">
              {staffHistory.slice(0, 5).map((record, index) => (
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
