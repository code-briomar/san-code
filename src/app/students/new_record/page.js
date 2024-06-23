"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Dot,
  LucideLoader,
  Pencil,
  PenSquare,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createNewStudentRecord } from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(true);
  const [admNo, setAdmno] = useState();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setPageLoading(true);
    if (!admission_number) {
      toast.error("An issue came up. Please try again");

      if (!devMode) {
        router.push("/students");
      }
    }

    setTimeout(() => {
      setAdmno(admission_number);
      setPageLoading(false);
    }, 1000);
  }, []);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      studentAdmNo: admNo,
      tempReading: "",
      complain: "",
      ailment: "",
      medication: "",
      going_to_hospital: false,
    },
    validationSchema: Yup.object({
      tempReading: Yup.string().required(
        "Student temperature reading is required!"
      ),
      complain: Yup.string().required("Student complains are required"),
      ailment: Yup.string().required("Student ailment is required"),
      medication: Yup.string().required("Medication administered is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      if (devMode) {
        console.log(values);
      }
      setLoading(true);

      // Fetch student data with the provided admission number
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

      toast.success(
        `Successfully created a new record for ${admission_number}`
      );
      setTimeout(() => {
        setLoading(false);

        if (!devMode) {
          router.push("/students");
        }
      }, 1000);
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {/* Title bar */}
      <div className="z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">
            &nbsp;New Record - Students
          </code>
        </p>
      </div>

      {/* Form : Enter new record */}
      <div className="sm:mb-32 ">
        <div className="border-b border-gray-300 pb-6 pt-8 lg:rounded-xl lg:p-8 lg:border">
          {pageLoading && <LucideLoader className="w-6 h-6 animate-spin" />}

          {!pageLoading && admNo !== null && (
            <>
              <div className="font-mono text-xs md:text-lg flex items-center mb-10 space-x-2">
                <Plus className={"w-5 h-5"} />
                <h3>CREATE NEW RECORD</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={"grid w-full gap-0.5"}>
                  <label for={"studentAdmNo"}>Admission Number</label>
                  <Input
                    name={"studentAdmNo"}
                    value={admNo}
                    type="text"
                    disabled
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className={"grid w-full gap-1.5"}>
                  <label for={"tempReading"}>Temperature Reading</label>
                  <Input
                    name={"tempReading"}
                    value={formik.values.tempReading}
                    onChange={formik.handleChange}
                    placeholder={"35.6"}
                    type="text"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className={"grid w-full gap-1.5"}>
                  <label for={"complain"}>Student Complains</label>
                  <Textarea
                    defaultValue={formik.values.complain}
                    onChange={formik.handleChange}
                    placeholder={"e.g Headache"}
                    name={"complain"}
                  />
                </div>
                <div className={"grid w-full gap-1.5"}>
                  <label for={"studentAdmNo"}>Ailment</label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                      >
                        <span className=" text-ellipsis overflow-hidden">
                          {formik.values.ailment
                            ? ailments.find(
                                (ailment) =>
                                  ailment.disease === formik.values.ailment
                              )?.disease
                            : "Select ailment..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search ailment..." />
                        <CommandList>
                          <CommandEmpty>No such ailment found.</CommandEmpty>
                          <CommandGroup>
                            {ailments.map((ailment) => (
                              <CommandItem
                                key={ailment.disease}
                                onSelect={(currentValue) => {
                                  formik.setFieldValue(
                                    "ailment",
                                    currentValue === formik.values.ailment
                                      ? ""
                                      : currentValue
                                  );

                                  console.log(formik.values.ailment);
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
                </div>
                <div className="grid w-full gap-1.5">
                  <label for={"medication"}>Medication</label>
                  <Input
                    name={"medication"}
                    value={formik.values.medication}
                    onChange={formik.handleChange}
                    placeholder={"e.g PCM"}
                    type={"text"}
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    name={"going_to_hospital"}
                    checked={
                      formik.values.going_to_hospital == 1 ? true : false
                    }
                    onCheckedChange={(value) => {
                      formik.setFieldValue("going_to_hospital", value);
                      if (devMode) console.log(formik.values.going_to_hospital);
                    }}
                  />
                  <Label className={"text-sm font-medium leading-none"}>
                    Is the student being taken to the hospital?
                  </Label>
                </div>
              </div>
              <Button
                variant="outline"
                className={
                  "flex space-x-1 items-center justify-center bg-green-500"
                }
                type="submit"
                onClick={formik.handleSubmit}
                disabled={!formik.isValid}
              >
                {loading && <LucideLoader className="w-6 h-6 animate-spin" />}
                {!loading && (
                  <>
                    <span>Submit</span>
                    <span>
                      <ArrowRight className="w-3 h-4" />
                    </span>
                  </>
                )}
              </Button>
              <Separator className={"m-2"} />
              <div>
                {formik?.errors?.tempReading && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.tempReading}
                    </p>
                  </div>
                )}
                {formik?.errors?.ailment && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.ailment}
                    </p>
                  </div>
                )}
                {formik?.errors?.complain && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.complain}
                    </p>
                  </div>
                )}
                {formik?.errors?.medication && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.medication}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
