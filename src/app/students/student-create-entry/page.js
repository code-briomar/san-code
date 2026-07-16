"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { devMode } from "@/lib/dev_mode";
import { ArrowLeft, ArrowRight, Loader } from "lucide-react";
import { createEntry } from "./services";

export default function StudentCreateEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 400);
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
      admNo: Yup.number()
        .typeError("Admission number must be a number")
        .required("Admission number is required"),
      fName: Yup.string().required("First name is required"),
      sName: Yup.string().required("Second name is required"),
      studentClass: Yup.string().required("Class is required"),
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
            router.push("/students");
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Action Bar */}
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/students")}
            className="rounded-full shadow-sm hover:scale-105 transition-transform border-zinc-350 dark:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Register New Student
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
              Create a new student profile in the sanatorium database
            </p>
          </div>
        </div>

        {/* Form Container */}
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
          <CardContent className="pt-6">
            {pageLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader className="w-6 h-6 animate-spin text-slate-900 dark:text-slate-100" />
                <p className="text-xs text-slate-450">Loading form components...</p>
              </div>
            )}

            {!pageLoading && (
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Admission Number */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="admNo" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Admission Number
                    </label>
                    <Input
                      id="admNo"
                      name="admNo"
                      placeholder="e.g. 13256"
                      value={formik.values.admNo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="text"
                      className="border-zinc-300 dark:border-zinc-800 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                    />
                    {formik.touched.admNo && formik.errors.admNo && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">{formik.errors.admNo}</p>
                    )}
                  </div>

                  {/* Class */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="studentClass" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Class
                    </label>
                    <Input
                      id="studentClass"
                      name="studentClass"
                      placeholder="e.g. 4D"
                      value={formik.values.studentClass}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="text"
                      className="border-zinc-300 dark:border-zinc-800 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                    />
                    {formik.touched.studentClass && formik.errors.studentClass && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">{formik.errors.studentClass}</p>
                    )}
                  </div>

                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fName" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      First Name
                    </label>
                    <Input
                      id="fName"
                      name="fName"
                      placeholder="e.g. Braine"
                      value={formik.values.fName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="text"
                      className="border-zinc-300 dark:border-zinc-800 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                    />
                    {formik.touched.fName && formik.errors.fName && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">{formik.errors.fName}</p>
                    )}
                  </div>

                  {/* Second Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sName" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Second Name
                    </label>
                    <Input
                      id="sName"
                      name="sName"
                      placeholder="e.g. Lomoni"
                      value={formik.values.sName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="text"
                      className="border-zinc-300 dark:border-zinc-800 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
                    />
                    {formik.touched.sName && formik.errors.sName && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">{formik.errors.sName}</p>
                    )}
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold w-full flex items-center justify-center gap-1.5"
                    type="submit"
                    disabled={!formik.isValid || loading}
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    {!loading && (
                      <>
                        <span>Register Student</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="border-zinc-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 w-full font-medium"
                    onClick={() => router.push("/students")}
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
