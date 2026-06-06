"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  LucideLoader,
  Pencil,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateStudentDetails } from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { fetchStudentData, createStudentFollowUp } from "../services";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function UpdateRecordStudents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admission_number = searchParams.get("admission_number");
  const [studentData, setStudentData] = useState();
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(true);
  const [admNo, setAdmno] = useState();

  // Follow-up scheduling states
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  useEffect(() => {
    setPageLoading(true);
    if (!admission_number) {
      toast.error("An issue came up. Please try again");
      if (!devMode) {
        router.push("/students");
      }
      return;
    }

    const loadData = async () => {
      const student_data = await fetchStudentData(admission_number);

      if (student_data == null) {
        toast.error("Student not found");
        setPageLoading(false);
        router.push("/students");
        return;
      }
      setAdmno(admission_number);
      setStudentData(student_data);
      setPageLoading(false);
    };

    setTimeout(loadData, 500);
  }, [admission_number, router]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      studentAdmNo: admNo,
      tempReading: studentData?.tempReading || "",
      complain: studentData?.complain || "",
      ailment: studentData?.ailment || "",
      medication: studentData?.medication || "",
      going_to_hospital: studentData?.going_to_hospital || false,
    },
    validationSchema: Yup.object({
      tempReading: Yup.string().required("Temperature is required"),
      complain: Yup.string().required("Complains are required"),
      medication: Yup.string().required("Medication is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);

      const response = await updateStudentDetails(
        Number(admission_number),
        Number(values.tempReading),
        values.complain,
        values.medication,
        values.going_to_hospital
      );

      if (response == null) {
        toast.error("Error updating record");
        setLoading(false);
        return;
      }

      if (scheduleFollowUp && followUpTime) {
        const followUpRes = await createStudentFollowUp(admission_number, followUpTime, followUpReason);
        if (devMode) console.log("Follow-up response:", followUpRes);
      }

      if (devMode) console.log(response);

      toast.success("Record updated successfully");
      setTimeout(() => {
        setLoading(false);
        if (!devMode) {
          router.push(`/students?admission_number=${admission_number}&saved=update`);
        }
      }, 1000);
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && formik.isValid) {
      formik.handleSubmit();
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-6">
        <button
          onClick={() => router.push("/students")}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Pencil className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Update Record</h1>
            <p className="text-sm text-gray-500">
              Student {admNo} - Modify existing record
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto">
        {pageLoading ? (
          <div className="flex items-center justify-center py-12">
            <LucideLoader className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/50">
            <div className="space-y-5">
              {/* Ailment - Read only */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <Label className="text-xs text-gray-500 block mb-1">
                  Ailment (cannot be changed)
                </Label>
                <p className="font-medium">{formik.values.ailment || "—"}</p>
              </div>

              {/* Temperature */}
              <div>
                <Label htmlFor="tempReading" className="text-sm font-medium mb-2 block">
                  Temperature Reading *
                </Label>
                <Input
                  id="tempReading"
                  name="tempReading"
                  value={formik.values.tempReading}
                  onChange={formik.handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g 36.5"
                  autoFocus
                  className="h-11"
                />
                {formik.touched.tempReading && formik.errors.tempReading && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.tempReading}</p>
                )}
              </div>

              {/* Complains */}
              <div>
                <Label htmlFor="complain" className="text-sm font-medium mb-2 block">
                  Student Complains *
                </Label>
                <Textarea
                  id="complain"
                  name="complain"
                  value={formik.values.complain}
                  onChange={formik.handleChange}
                  placeholder="e.g Headache, stomach pain..."
                  rows={3}
                  className="resize-none"
                />
                {formik.touched.complain && formik.errors.complain && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.complain}</p>
                )}
              </div>

              {/* Medication */}
              <div>
                <Label htmlFor="medication" className="text-sm font-medium mb-2 block">
                  Medication *
                </Label>
                <Input
                  id="medication"
                  name="medication"
                  value={formik.values.medication}
                  onChange={formik.handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g Paracetamol, Amoxicillin..."
                  className="h-11"
                />
                {formik.touched.medication && formik.errors.medication && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.medication}</p>
                )}
              </div>

              {/* Going to hospital */}
              <div className="flex items-center gap-3 py-1">
                <Checkbox
                  id="going_to_hospital"
                  name="going_to_hospital"
                  checked={formik.values.going_to_hospital}
                  onCheckedChange={(value) => {
                    formik.setFieldValue("going_to_hospital", value);
                  }}
                />
                <Label htmlFor="going_to_hospital" className="text-sm cursor-pointer">
                  Refer to hospital
                </Label>
              </div>

              {/* Schedule Follow-up / Return visit */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="schedule_followup"
                    checked={scheduleFollowUp}
                    onCheckedChange={(value) => setScheduleFollowUp(value)}
                  />
                  <Label htmlFor="schedule_followup" className="text-sm cursor-pointer font-medium text-slate-800 dark:text-zinc-300">
                    Schedule a return visit / follow-up
                  </Label>
                </div>

                {scheduleFollowUp && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label htmlFor="followup_time" className="text-xs font-semibold text-slate-500">Scheduled Time *</Label>
                      <Input
                        id="followup_time"
                        type="datetime-local"
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="h-10 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="followup_reason" className="text-xs font-semibold text-slate-500">Reason for Return</Label>
                      <Input
                        id="followup_reason"
                        placeholder="e.g. Next dose, dressing"
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                className="w-full h-11"
                onClick={formik.handleSubmit}
                disabled={loading || !formik.isValid}
              >
                {loading ? (
                  <LucideLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Update Record</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
