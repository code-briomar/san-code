"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Dot, LucideLoader, PenSquare } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateEntry } from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStudentData } from "../services";

export default function StudentUpdateEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admission_number = searchParams.get("admission_number");
  const [studentData, setStudentData] = useState();
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(true);
  const [admNo, setAdmno] = useState();

  useEffect(() => {
    setPageLoading(true);
    if (!admission_number) {
      toast.error("An issue came up. Please try again");

      if (!devMode) {
        router.push("/students");
      }
    }

    setTimeout(async () => {
      const student_data = await fetchStudentData(admission_number);

      if (student_data == null) {
        toast.error("Student not found");
        setPageLoading(false);
        formikHelpers.resetForm();
        return;
      }
      setAdmno(admission_number);
      setStudentData(student_data);
      setPageLoading(false);
    }, 1000);
  }, []);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      studentAdmNo: admNo || "",
      fName: studentData?.fName || "",
      sName: studentData?.sName || "",
      studentClass: studentData?.class || "",
    },
    validationSchema: Yup.object({
      fName: Yup.string().required("First name is required"),
      sName: Yup.string().required("Second name is required"),
      studentClass: Yup.string().required("Student class is required  "),
    }),
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);

      const { studentAdmNo, fName, sName, studentClass } = values;

      console.log(values);

      try {
        const response = await updateEntry({
          admNo: admNo,
          fName,
          sName,
          studentClass,
        });

        if (response == null) {
          toast.error("Error inserting records");
          setLoading(false);
          formikHelpers.resetForm();
          return;
        }

        if (devMode) console.log(response);

        if (response.data.status === 200) {
          toast.success(`Successfully updated record for ${admNo}.`);

          setTimeout(() => {
            setLoading(false);

            if (!devMode) {
              router.push("/students");
            }
          }, 1000);
        } else if (response.data.status === 500) {
          toast.error(`Failed to update record for ${admNo}`);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        if (devMode && console.error(error))
          toast.error("An unexpected error occurred.");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">
            &nbsp;Update Student Entry
          </code>
        </p>


        <div className="hidden lg:flex lg:space-x-4 lg:ml-4 lg:mt-2">
          <Link
            href="/"
            className="flex items-end space-x-1 text-base text-blue-500 underline font-semibold"
          >
            Home
          </Link>
          <Link
            href="/students"
            className="flex items-end space-x-1 text-base text-blue-500 underline font-semibold"
          >
            Students
          </Link>
        </div>
        
      </div>

      <div className="sm:mb-32 ">
        <div className="border-b border-gray-300 pb-6 pt-8 lg:rounded-xl lg:p-8 lg:border">
          {pageLoading && <LucideLoader className="w-6 h-6 animate-spin" />}

          {!pageLoading && admNo !== null && (
            <>
              <div className="font-mono text-xs md:text-lg flex items-center mb-10 space-x-2">
                <PenSquare className={"w-5 h-5"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={"grid w-full gap-0.5"}>
                  <label htmlFor={"admNo"}>Admission Number</label>
                  <Input
                    name={"admNo"}
                    value={admNo}
                    type="text"
                    disabled
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className={"grid w-full gap-0.5"}>
                  <label htmlFor={"fName"}>First Name</label>
                  <Input
                    name={"fName"}
                    value={formik.values.fName}
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>

                <div className={"grid w-full gap-0.5"}>
                  <label htmlFor={"sName"}>Second Name</label>
                  <Input
                    name={"sName"}
                    value={formik.values.sName}
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>

                <div className={"grid w-full gap-0.5"}>
                  <label htmlFor={"studentClass"}>Class</label>
                  <Input
                    name={"studentClass"}
                    value={formik.values.studentClass}
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
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
                    <span>Update</span>
                    <span>
                      <ArrowRight className="w-3 h-4" />
                    </span>
                  </>
                )}
              </Button>
              <Separator className={"m-2"} />
              <div>
                {formik?.errors?.fName && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.fName}
                    </p>
                  </div>
                )}
                {formik?.errors?.sName && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.sName}
                    </p>
                  </div>
                )}
                {formik?.errors?.studentClass && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.studentClass}
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
