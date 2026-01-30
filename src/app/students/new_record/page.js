"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  LucideLoader,
  Plus,
  Repeat,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createNewStudentRecord } from "./services";
import { fetchStudentData } from "../services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ailments } from "./ailments";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function NewRecordStudents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admission_number = searchParams.get("admission_number");
  const prefill = searchParams.get("prefill") === "true";
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(true);
  const [admNo, setAdmno] = useState();
  const [prefillData, setPrefillData] = useState(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setPageLoading(true);
    if (!admission_number) {
      toast.error("An issue came up. Please try again");
      if (!devMode) {
        router.push("/students");
      }
    }

    const loadData = async () => {
      setAdmno(admission_number);

      if (prefill && admission_number) {
        const studentData = await fetchStudentData(admission_number);
        if (studentData) {
          setPrefillData({
            complain: studentData.complain || "",
            ailment: studentData.ailment || "",
            medication: studentData.medication || "",
          });
          toast.info("Form pre-filled with previous visit data");
        }
      }

      setPageLoading(false);
    };

    setTimeout(loadData, 500);
  }, [admission_number, prefill, router]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      studentAdmNo: admNo,
      tempReading: "",
      complain: prefillData?.complain || "",
      ailment: prefillData?.ailment || "",
      medication: prefillData?.medication || "",
      going_to_hospital: false,
    },
    validationSchema: Yup.object({
      tempReading: Yup.string().required("Temperature is required"),
      complain: Yup.string().required("Complains are required"),
      ailment: Yup.string().required("Ailment is required"),
      medication: Yup.string().required("Medication is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      if (devMode) console.log(values);
      setLoading(true);

      const response = await createNewStudentRecord({
        studentAdmNo: admNo,
        tempReading: values.tempReading,
        complain: values.complain,
        ailment: values.ailment,
        medication: values.medication,
        going_to_hospital: values.going_to_hospital,
      });

      if (response == null) {
        toast.error("Error inserting records");
        setLoading(false);
        formikHelpers.resetForm();
        return;
      }

      if (devMode) console.log(response);

      toast.success(`Record created for ${admission_number}`);
      setTimeout(() => {
        setLoading(false);
        if (!devMode) {
          router.push(`/students?admission_number=${admNo}&saved=new`);
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
          {prefillData ? (
            <>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Repeat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Repeat Visit</h1>
                <p className="text-sm text-gray-500">
                  Student {admNo} - Pre-filled from last visit
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">New Record</h1>
                <p className="text-sm text-gray-500">Student {admNo}</p>
              </div>
            </>
          )}
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

              {/* Ailment */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Ailment *
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full h-11 justify-between font-normal"
                    >
                      <span className={formik.values.ailment ? "" : "text-gray-500"}>
                        {formik.values.ailment || "Select ailment..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search ailment..." />
                      <CommandList>
                        <CommandEmpty>No ailment found.</CommandEmpty>
                        <CommandGroup>
                          {ailments.map((ailment) => (
                            <CommandItem
                              key={ailment.disease}
                              onSelect={(currentValue) => {
                                formik.setFieldValue(
                                  "ailment",
                                  currentValue === formik.values.ailment ? "" : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formik.values.ailment === ailment.disease
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {ailment.disease}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formik.touched.ailment && formik.errors.ailment && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.ailment}</p>
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
              <div className="flex items-center gap-3 py-2">
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
                    <span>Submit Record</span>
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
