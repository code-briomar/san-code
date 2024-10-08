"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ArrowUpRightFromSquare,
  Loader,
  LucideLoader,
  Pencil,
  PenSquare,
  Plus,
  Trash,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchStudentData,
  fetchStudentsGoingToHospital,
  updateStudentDetails,
} from "./services";
import { toast } from "sonner";
import { devMode } from "@/lib/dev_mode";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data_table";

export default function Students() {
  const router = useRouter();
  const [loading, setLoading] = useState();
  const [pageLoading, setPageLoading] = useState(false);
  const [studentData, setStudentData] = useState();
  const [studentsGoingToHospital, setStudentsGoingToHospital] = useState();
  const [directingTo, setDirectingTo] = useState();

  const formik = useFormik({
    initialValues: {
      admission_number: "",
    },
    validationSchema: Yup.object({
      admission_number: Yup.string().required("Required"),
    }),
    onChange: (values) => {
      if (values.admission_number.length > 0) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    },
    onSubmit: async (values, formikHelpers) => {
      setLoading(true);
      // Fetch student data with the provided admission number
      const student_data = await fetchStudentData(values.admission_number);

      if (student_data == null) {
        toast.error("Student not found");
        setLoading(false);
        // setPageLoading(false);
        formikHelpers.resetForm();
        return;
      }

      if (devMode) console.log(student_data);

      setTimeout(() => {
        setStudentData(student_data);
        setLoading(false);
      }, 1000);
    },
  });

  // Function : Direct to required page
  const directToPage = (link, directingTo) => {
    setDirectingTo(directingTo);
    setLoading(true);
    setTimeout(() => {
      const searchParams = new URLSearchParams({
        admission_number: studentData?.admNo,
      });
      router.push(`${link}?${searchParams.toString()}`);
      setLoading(false);
      return;
    }, 1000);
  };

  // Function : Set students going to hospital data
  const goingToHospital = async () => {
    const data = await fetchStudentsGoingToHospital();

    setStudentsGoingToHospital(data);

    devMode && console.log(data);
  };

  useEffect(() => {
    goingToHospital();
  }, []);

  const studentsGoingToHospitalColumns = [
    {
      accessorKey: "admNo",
      header: "Adm. No",
    },
    {
      accessorKey: "fName",
      header: "Student Name",
      cell: ({ row }) => {
        const student = row.original;
        return `${student?.fName} ${student?.sName}`;
      },
    },
    {
      accessorKey: "class",
      header: "Class",
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
    },
    {
      accessorKey: "timestamp",
      header: "Date",
      cell: ({ row }) => {
        const timestamp = row.original?.timestamp;
        return new Date(timestamp).toDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const admNo = row.original?.admNo;
        const tempReading = row.original?.tempReading;
        const complain = row.original?.complain;
        const ailment = row.original?.ailment;

        return (
          <Button
            variant={"outline"}
            className={"cursor-pointer"}
            onClick={() => {
              updateStudentDetails(
                admNo,
                tempReading,
                complain,
                ailment,
                false
              );
              goingToHospital();
            }}
          >
            <Trash className="w-5 h-5 text-rose-500" />
          </Button>
        );
      },
    },
  ];

  // Enter key pressed to submit form.
  const handleKeyPressed = (e) => {
    if (e.key === "Enter") {
      formik.handleSubmit();
    }
  };

  // Over-engineering at it's finest lol.
  const [isTyping, setIsTyping] = useState(false);
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-24">
        {/* Title bar */}
        <div className="z-10 max-w-5xl w-full items-center font-mono text-sm lg:flex lg:justify-between">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            <code className="font-mono font-bold">&nbsp;Students</code>
          </p>

          <div className="hidden lg:flex lg:space-x-5 lg:ml-10 lg:mt-2">
            <Link
              href={"/"}
              className="text-blue-500 underline font-semibold text-base"
            >
              Home
            </Link>
            <Link
              href={"/students/student-create-entry"}
              className="text-blue-500 underline font-semibold text-base"
            >
              Add New Student To Database
            </Link>
          </div>
        </div>

        {/* Form : 1. Get record by admission number 2. Enter new record. 3. Update record. */}
        <div className="sm:mb-32 ">
          <div className="border-b border-gray-300 pb-6 pt-8 lg:rounded-xl lg:p-8 lg:border">
            {!studentData && (
              <>
                <span className="font-mono text-xs md:text-base">
                  Search for student's admission number
                </span>
                <div className="flex flex-col lg:flex-row lg:space-x-2 lg:items-center">
                  <Input
                    name={"admission_number"}
                    value={formik.values.admission_number}
                    type="text"
                    autoComplete="false"
                    placeholder="e.g 13256"
                    className="my-5 outline outline-gray-200 outline-[1px] focus:outline-red-500"
                    onChange={formik.handleChange}
                    onKeyDown={handleKeyPressed}
                  />
                  <Button
                    variant="outline"
                    className={"flex space-x-1 items-center justify-center"}
                    type="submit"
                    onClick={formik.handleSubmit}
                  >
                    {loading && (
                      <LucideLoader className="w-6 h-6 animate-spin" />
                    )}
                    {!loading && (
                      <>
                        <span>Search</span>
                        <span>
                          <ArrowRight className="w-3 h-4" />
                        </span>
                      </>
                    )}
                  </Button>
                </div>
                {formik.values.admission_number.length > 0 && (
                  <div className="text-gray-500 text-xs">
                    Press{" "}
                    <kbd className="px-1 border border-gray-300 rounded">
                      Enter
                    </kbd>{" "}
                    to search
                  </div>
                )}
                <div className="flex space-x-10 mt-10">
                  <Link
                    href={"/view_summary"}
                    target="_blank"
                    className={
                      "text-[#039be5] underline flex gap-2 items-center"
                    }
                  >
                    {"View Summary"}
                    <ArrowUpRightFromSquare className={"w-5 h-5"} />
                  </Link>

                  <Link
                    href={"/students/non_busherian"}
                    target="_blank"
                    className={
                      "text-[#039be5] underline flex gap-2 items-center"
                    }
                  >
                    {/* Entry for student who isn't a busherian */}
                    {"Non-Busherian"}
                    <ArrowUpRightFromSquare className={"w-5 h-5"} />
                  </Link>
                </div>
              </>
            )}

            {studentData && (
              <>
                <div className="font-mono flex items-center space-x-1">
                  <span>{studentData?.admNo}</span>
                  <ArrowRight className={"w-5 h-5"} />
                  <span className="flex space-x-2">
                    {studentData?.fName}&nbsp;
                    {studentData?.sName}
                  </span>
                </div>
                <div
                className="flex items-center space-x-2 font-mono my-3 justify-between"
                >
                  <span>
                    <code>Class</code>
                    &nbsp;:&nbsp;
                    <code>{studentData?.class}</code>
                  </span>

                  <Link
                    href={`/students/student-update-entry/?admission_number=${studentData?.admNo}`}
                    className="text-blue-500 underline font-semibold text-sm flex items-center space-x-2"
                  >
                    <span>Edit</span>
                    <PenSquare className="w-4 h-4" />
                  </Link>
                </div>
                <Separator className={"my-2"} />
                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Temperature Reading</span>
                    <span
                      className={`${
                        studentData?.tempReading > 37
                          ? "text-rose-500"
                          : "text-green-500"
                      }`}
                    >
                      {studentData?.tempReading}
                    </span>
                  </div>
                </div>
                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Complains</span>
                    <span
                      className={"text-blue-500 font-semibold  tracking-tight"}
                    >
                      {studentData?.complain}
                    </span>
                  </div>
                </div>
                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Ailment</span>
                    <span
                      className={"text-blue-500 font-semibold  tracking-tight"}
                    >
                      {studentData?.ailment}
                    </span>
                  </div>
                </div>
                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Medication(s)</span>
                    <span
                      className={"text-blue-500 font-semibold  tracking-tight"}
                    >
                      {studentData?.medication}
                    </span>
                  </div>
                </div>

                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Days on Medication</span>
                    <span
                      className={"text-blue-500 font-semibold  tracking-tight"}
                    >
                      {
                        // studentData?.timestamp
                        new Date().getDate() -
                          new Date(studentData?.timestamp).getDate() +
                          1
                      }
                    </span>
                  </div>
                </div>

                <div className={"font-mono my-3"}>
                  <div className="flex flex-col space-y-2">
                    <span className="underline">Last took meds</span>
                    <span
                      className={"text-blue-500 font-semibold  tracking-tight"}
                    >
                      {
                        // e.g lunchtime, morning or evening
                        new Date(studentData?.timestamp).getHours() >= 12
                          ? "at lunchtime"
                          : new Date(studentData?.timestamp).getHours() >= 6
                          ? "in the morning"
                          : "in the evening"
                      }
                    </span>
                  </div>
                </div>
                <div className={"font-mono my-3 w-full"}>
                  <div className="flex md:space-x-2 flex-col md:flex-row space-y-2 md:space-y-0">
                    <Button
                      variant={"outline"}
                      className={"flex items-center space-x-2"}
                      onClick={() =>
                        directToPage("/students/new_record", "new_record")
                      }
                    >
                      <>
                        {!loading && <Plus className="w-4 h-4" />}
                        <span>New Record</span>
                      </>

                      {loading && directingTo == "new_record" && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                    </Button>

                    <Button
                      variant={"outline"}
                      className={"flex items-center space-x-2 w-full"}
                      onClick={() =>
                        directToPage("/students/update_record", "update_record")
                      }
                    >
                      <Pencil className="w-5 h-5" />
                      <span>Update Record</span>
                      {loading && directingTo == "update_record" && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                    </Button>
                    <Button
                      variant={"destructive"}
                      className={"flex items-center space-x-2"}
                      onClick={() => setStudentData(null)}
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {!studentData && studentsGoingToHospital && (
          <div className="hidden md:block w-full">
            <span className="self-center font-mono text-base underline">
              Students going to the hospital
            </span>
            <div>
              {studentsGoingToHospital && (
                <DataTable
                  data={studentsGoingToHospital}
                  columns={studentsGoingToHospitalColumns}
                />
              )}
              {!studentsGoingToHospital && (
                <p className="font-mono text-base">
                  No Students Going To The Hospital Today.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
