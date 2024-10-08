"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Dot, Home, LucideLoader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createEntry } from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentCreateEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 800);
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      admNo: "",
      fName: "",
      sName: "",
      studentClass: "",
    },
    validationSchema: Yup.object({
      admNo: Yup.number().required("student's admission number is required!"),
      fName: Yup.string().required("student's first name is required"),
      sName: Yup.string().required("student's second name is required"),
      studentClass: Yup.string().required("student's class is required"),
    }),
    onSubmit: async (values, formikHelpers) => {
      if (devMode) {
        console.log(values);
      }
      setLoading(true);

      const { admNo, fName, sName, studentClass } = values;

      try {
        const response = await createEntry({
          admNo,
          fName,
          sName,
          class: studentClass,
        });

        if (response == null) {
          toast.error("Error inserting records");
          setLoading(false);
          formikHelpers.resetForm();
          return;
        }

        if (devMode) console.log(response);

        if (response.data.status === 200) {
          toast.success(`Successfully added ${admNo} to the database.`);

          setTimeout(() => {
            setLoading(false);

            if (!devMode) {
              router.push("/students");
            }
          }, 1000);
        } else if (response.data.status === 500) {
          toast.error(`Failed to add ${admNo} to the database.`);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error(`Record with admission number ${admNo} already exists.`);
        } else {
          toast.error("An unexpected error occurred.");
        }
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="mb-10 z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex justify-between">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">
            &nbsp;Add a student to the database
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

          {!pageLoading && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className={"grid w-full gap-0.5"}>
                  <label htmlFor={"admNo"}>Admission Number</label>
                  <Input
                    name={"admNo"}
                    placeholder={"e.g 13256"}
                    value={formik.values.admNo}
                    onChange={formik.handleChange}
                    type="text"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className={"grid w-full gap-1.5"}>
                  <label htmlFor={"fName"}>First Name</label>
                  <Input
                    name={"fName"}
                    value={formik.values.fName}
                    onChange={formik.handleChange}
                    placeholder={"e.g Braine"}
                    type="text"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className={"grid w-full gap-1.5"}>
                  <label htmlFor={"sName"}>Second Name</label>
                  <Input
                    name={"sName"}
                    value={formik.values.sName}
                    onChange={formik.handleChange}
                    placeholder={"e.g Lomoni"}
                    type="text"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <label htmlFor={"studentClass"}>Class</label>
                  <Input
                    name={"studentClass"}
                    value={formik.values.studentClass}
                    onChange={formik.handleChange}
                    placeholder={"e.g 4D"}
                    type={"text"}
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
                    <span>Submit</span>
                    <span>
                      <ArrowRight className="w-3 h-4" />
                    </span>
                  </>
                )}
              </Button>
              <Separator className={"m-2"} />
              <div>
                {formik?.errors?.admNo && (
                  <div className={"flex text-sm text-rose-500"}>
                    <p className={"flex items-center"}>
                      <Dot className={"w-5 h-5"} />
                      {formik?.errors?.admNo}
                    </p>
                  </div>
                )}
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
    </div>
  );
}
