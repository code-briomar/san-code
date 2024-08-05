"use client";
import React, { useEffect, useState } from "react";
import { fetchStaffData, fetchStudentData } from "./services";
import { DataTable } from "@/components/ui/data_table";
import {
  ArrowLeft,
  ArrowUpRightIcon,
  Loader,
  MessageCircleQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ViewSummary = () => {
  const router = useRouter();
  const [summaryStudents, setSummaryStudents] = useState([]);
  const [summaryStaff, setSummaryStaff] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    setTimeout(async () => {
      const response_staff_fetch = await fetchStaffData();

      const response_student_fetch = await fetchStudentData();

      console.log(response_staff_fetch, response_student_fetch);

      setSummaryStudents(response_student_fetch?.data);

      setSummaryStaff(response_staff_fetch?.data);

      setPageLoading(false);
    }, 0);
  }, []);

  //   recordID: 1082,
  //         admNo: 13256,
  //     fName: 'BRIANE',
  //     sName: 'LOMONI',
  //     class: '5D',
  //     tempReading: 36.7,
  //     complain: 'Fever',
  //     ailment: 'Fevers',
  //     medication: 'PCM',
  //     timestamp: '2023-12-20T13:05:13.515Z',
  //     tName: null,
  //     fourthName: null

  const summary_columns_students = [
    {
      accessorKey: "fName",
      header: "First Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;

        return (
          <div className="flex space-x-1">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "admNo",
      header: "Adm. No",
    },
  ];

  const summary_columns_large_screen_students = [
    {
      accessorKey: "admNo",
      header: "Adm. No",
    },
    {
      accessorKey: "fName",
      header: "First Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;

        return (
          <div className="flex space-x-1">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
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
      accessorKey: "medication",
      header: "Medication",
    },
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => {
        // Format timestamp
        const timestamp = new Date(row?.original?.timestamp).toLocaleString();

        // Apply color to timestamp to indicate how recent the record is - 2 days
        const timestampColor =
          new Date(row?.original?.timestamp) > new Date() - 172800000
            ? "text-green-500"
            : "text-gray-500";

        return (
          <div className="flex space-x-1">
            <span className={timestampColor}>{timestamp}</span>
          </div>
        );
      },
    },
  ];

  const summary_columns_staff = [
    {
      accessorKey: "idNo",
      header: "ID No",
    },
    {
      accessorKey: "fName",
      header: "First Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;

        return (
          <div className="flex space-x-1">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
  ];

  const summary_columns_large_screen_staff = [
    {
      accessorKey: "idNo",
      header: "ID No",
    },
    {
      accessorKey: "fName",
      header: "Name",
      cell: ({ row }) => {
        const fName = row?.original?.fName;
        const sName = row?.original?.sName;

        return (
          <div className="flex space-x-1">
            <span>{fName}</span>
            <span>{sName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "ailment",
      header: "Ailment",
    },
    {
      accessorKey: "medication",
      header: "Medication",
    },
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => {
        // Format timestamp
        const timestamp = new Date(row?.original?.timestamp).toLocaleString();

        // Apply color to timestamp to indicate how recent the record is - 3 days
        const timestampColor =
          new Date(row?.original?.timestamp) > new Date() - 259200000
            ? "text-green-500"
            : "text-gray-500";

        return (
          <div className="flex space-x-1">
            <span className={timestampColor}>{timestamp}</span>
          </div>
        );
      },
    },
  ];

  // console.log(summaryStaff, summaryStudents);

  return (
    <div className={"md:mx-20 md:mt-20"}>
      <div className={"flex justify-between items-center"}>
        <h3 className={"mt-8 scroll-m-20 text-2xl tracking-tight"}>
          {/* Records for the last 7 days */}
          {/* TEMPOARY */}
          Records.
        </h3>

        <Link
          href={{
            pathname: "/report",
          }}
          className={"text-blue-500 underline flex"}
          target="_blank"
        >
          View official report
          <ArrowUpRightIcon className="w-5 h-5" />
        </Link>

        <Button variant={"outline"} onClick={() => router.push("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      {pageLoading && <Loader className={"w-5 h-5 animate-spin"} />}
      {summaryStudents?.length > 0 && !pageLoading && (
        <>
          <h4
            className={"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"}
          >
            Students
          </h4>
          <div className={"md:hidden"}>
            <DataTable
              data={summaryStudents}
              columns={summary_columns_students}
            />
          </div>

          <div className={"hidden md:block"}>
            <DataTable
              data={summaryStudents}
              columns={summary_columns_large_screen_students}
            />
          </div>
        </>
      )}
      {summaryStaff?.length > 0 && !pageLoading && (
        <>
          <h4
            className={"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"}
          >
            Staff
          </h4>
          <div className={"md:hidden"}>
            <DataTable data={summaryStaff} columns={summary_columns_staff} />
          </div>

          <div className={"hidden md:block"}>
            <DataTable
              data={summaryStaff}
              columns={summary_columns_large_screen_staff}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ViewSummary;
