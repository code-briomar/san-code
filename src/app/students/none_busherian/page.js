"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronsUpDown,
  LucideLoader,
  Pill,
  Stethoscope,
  Thermometer,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { devMode } from "@/lib/dev_mode";
import { ailments } from "../new_record/ailments";
import { createNonBusherianRecord, fetchNonBusherianRecords } from "./services";

export default function NonBusherian() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ailmentOpen, setAilmentOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);

  // Fetch non-Busherian records on mount
  useEffect(() => {
    const loadRecords = async () => {
      setRecordsLoading(true);
      const data = await fetchNonBusherianRecords();
      setRecords(data);
      setRecordsLoading(false);
    };
    loadRecords();
  }, []);

  const refreshRecords = async () => {
    const data = await fetchNonBusherianRecords();
    setRecords(data);
  };

  const formik = useFormik({
    initialValues: {
      studentName: "",
      schoolName: "",
      tempReading: "",
      complain: "",
      ailment: "",
      medication: "",
      going_to_hospital: false,
    },
    validationSchema: Yup.object({
      studentName: Yup.string().required("Student name is required"),
      schoolName: Yup.string().required("School name is required"),
      tempReading: Yup.string().required("Temperature is required"),
      complain: Yup.string().required("Complaint is required"),
      ailment: Yup.string().required("Ailment is required"),
      medication: Yup.string().required("Medication is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      if (devMode) console.log(values);
      setLoading(true);

      const response = await createNonBusherianRecord({
        studentName: values.studentName,
        schoolName: values.schoolName,
        tempReading: values.tempReading,
        complain: values.complain,
        ailment: values.ailment,
        medication: values.medication,
        going_to_hospital: values.going_to_hospital,
      });

      if (response == null) {
        toast.error("Error creating record. Please try again.");
        setLoading(false);
        return;
      }

      if (devMode) console.log(response);

      toast.success(`Record created for ${values.studentName}`);
      setLoading(false);
      formikHelpers.resetForm();
      refreshRecords();
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && formik.isValid) {
      formik.handleSubmit();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSchoolName = (className) => {
    // Remove [NB] prefix to get school name
    return className?.replace("[NB] ", "") || "Unknown";
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          onClick={() => router.push("/students")}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Non-Busherian Students</h1>
              <p className="text-sm text-gray-500">
                Create and view records for visiting students
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "View Records" : "New Record"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {showForm ? (
          /* Form */
          <div className="max-w-xl mx-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/50">
            <div className="space-y-5">
              {/* Student Name */}
              <div>
                <Label htmlFor="studentName" className="text-sm font-medium mb-2 block">
                  Student Name *
                </Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formik.values.studentName}
                  onChange={formik.handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g John Doe"
                  autoFocus
                  className="h-11"
                />
                {formik.touched.studentName && formik.errors.studentName && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.studentName}</p>
                )}
              </div>

              {/* School Name */}
              <div>
                <Label htmlFor="schoolName" className="text-sm font-medium mb-2 block">
                  School Name *
                </Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formik.values.schoolName}
                  onChange={formik.handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g St. Mary's Academy"
                  className="h-11"
                />
                {formik.touched.schoolName && formik.errors.schoolName && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.schoolName}</p>
                )}
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
                  className="h-11"
                />
                {formik.touched.tempReading && formik.errors.tempReading && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.tempReading}</p>
                )}
              </div>

              {/* Complaint */}
              <div>
                <Label htmlFor="complain" className="text-sm font-medium mb-2 block">
                  Student Complaint *
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
                <Popover open={ailmentOpen} onOpenChange={setAilmentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={ailmentOpen}
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
                                setAilmentOpen(false);
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
                type="submit"
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
        ) : (
          /* Records List */
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <h2 className="font-medium">Recent Non-Busherian Records</h2>
              </div>
              <span className="text-sm text-gray-500">{records.length} records</span>
            </div>

            {recordsLoading ? (
              <div className="p-8 flex items-center justify-center">
                <LucideLoader className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No non-Busherian records found
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {records.map((record, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {record.fName} {record.sName}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {getSchoolName(record.class)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-mono ${
                            record.tempReading > 37
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <Thermometer className="w-3 h-3 inline mr-1" />
                          {record.tempReading}°C
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(record.timestamp)}
                        </p>
                      </div>
                    </div>

                    {record.complain && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {record.complain}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {record.ailment && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          <Stethoscope className="w-3 h-3" />
                          {record.ailment}
                        </span>
                      )}
                      {record.medication && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <Pill className="w-3 h-3" />
                          {record.medication}
                        </span>
                      )}
                      {record.going_to_hospital === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          Referred to hospital
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
