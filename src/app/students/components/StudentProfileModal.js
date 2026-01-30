"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data_table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Loader,
  Pencil,
  PenSquare,
  Plus,
  Repeat,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const student_history_columns = [
  {
    accessorKey: "action_timestamp",
    header: "Date",
    cell: ({ row }) => {
      const timestamp = row.original?.timestamp;
      return new Date(timestamp).toDateString();
    },
  },
  {
    accessorKey: "medication",
    header: "Medication",
  },
  {
    accessorKey: "ailment",
    header: "Ailment",
  },
  {
    accessorKey: "complain",
    header: "Complains",
  },
  {
    accessorKey: "tempreading",
    header: "Temp.",
  },
];

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
    if (hour >= 5 && hour < 12) return "in the morning";
    if (hour >= 12 && hour < 17) return "at lunchtime";
    if (hour >= 17 && hour < 19) return "in the evening";
    return "at night";
  };

  const daysOnMedication =
    new Date().getDate() - new Date(studentData?.timestamp).getDate() + 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-lg">
            <span className="text-blue-600">{studentData?.admNo}</span>
            <ArrowRight className="w-4 h-4" />
            <span>
              {studentData?.fName} {studentData?.sName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Student Info */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-gray-500">Class</p>
            <p className="font-semibold">{studentData?.class}</p>
          </div>
          <div>
            <p className="text-gray-500">Temperature</p>
            <p
              className={`font-semibold ${
                studentData?.tempReading > 37
                  ? "text-rose-500"
                  : "text-green-500"
              }`}
            >
              {studentData?.tempReading}°C
            </p>
          </div>
          <div>
            <p className="text-gray-500">Days on meds</p>
            <p className="font-semibold">{daysOnMedication}</p>
          </div>
          <div>
            <p className="text-gray-500">Last took meds</p>
            <p className="font-semibold">{getTimeOfDay(studentData?.timestamp)}</p>
          </div>
          <div>
            <p className="text-gray-500">Ailment</p>
            <p className="font-semibold text-blue-600">{studentData?.ailment || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Medication</p>
            <p className="font-semibold text-blue-600">{studentData?.medication || "-"}</p>
          </div>
          <div className="col-span-3 md:col-span-6">
            <p className="text-gray-500">Complains</p>
            <p className="font-semibold text-blue-600">{studentData?.complain || "-"}</p>
          </div>
        </div>

        {/* History */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold uppercase text-sm">History</h3>
            <a
              href={`/students/student-update-entry/?admission_number=${studentData?.admNo}`}
              className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
            >
              <span>Edit Profile</span>
              <PenSquare className="w-3 h-3" />
            </a>
          </div>
          {studentHistory?.length > 0 ? (
            <DataTable
              data={studentHistory}
              columns={student_history_columns}
              compact
              pageSize={3}
            />
          ) : (
            <p className="text-gray-500 text-sm">No history available</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => directToPage("/students/new_record", "new_record")}
            disabled={loading}
          >
            {loading && directingTo === "new_record" ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>New Record</span>
          </Button>

          {studentData?.ailment && studentData?.medication && (
            <Button
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={handleRepeatVisit}
              disabled={loading}
            >
              {loading && directingTo === "repeat_visit" ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              <span>Repeat Visit</span>
            </Button>
          )}

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              directToPage("/students/update_record", "update_record")
            }
            disabled={loading}
          >
            {loading && directingTo === "update_record" ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
            <span>Update Record</span>
          </Button>

          <Button
            variant="destructive"
            className="flex items-center gap-2 ml-auto"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
