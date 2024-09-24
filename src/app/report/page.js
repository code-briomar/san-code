"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ailments } from "../staff/ailments";
import Link from "next/link";
import { fetchReportData } from "./services";
import { useEffect, useState } from "react";
import { devMode } from "@/lib/dev_mode";
import { updateReport } from "../services";
import { Loader } from "lucide-react";
import jsPDF from "jspdf";
import ReactToPrint from "react-to-print";

const Report = () => {
  const data = [
    {
      1: 32,
      2: 20,
      3: 40,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
      17: 0,
      18: 0,
      19: 0,
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      27: 0,
      28: 0,
      29: 0,
      30: 0,
      31: 0,
      disease: "Diarrhoea",
    },
    // Add other disease data objects here
  ];

  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFromReportEndpoint = async () => {
    setIsLoading(true);

    try {
      const updateReportResponse = await updateReport();
      console.log(updateReportResponse);
      const response = await fetchReportData();

      if (devMode) console.log(response);

      setReportData(response?.data);
    } catch (error) {
      if (devMode) {
        console.error("An error occurred while fetching the data: ", error);
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (reportData.length === 0) {
      fetchFromReportEndpoint();
    }
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Create a lookup object for quick data access
  const diseaseDataLookup = reportData.reduce((lookup, entry) => {
    lookup[entry.disease] = entry;
    return lookup;
  }, {});

  // Download the report in csv
  const downloadReportInCSV = () => {
    // Construct the header row
    const miscellaneousInfo = `${
      new Date().toLocaleString("default", { month: "long" }) +
      " " +
      new Date().getFullYear()
    }.\n`;
    const headerRow_1 = ["Facility Name:________________________________", "Ward:________________________________", "Sub-County:________________________________", "County:________________________________"];
    const headerRow_2 = ["Disease (First Cases Only)", ...days].join(",");

    // Construct data rows
    const dataRows = ailments.map(({ disease }) => {
      const rowData = days.map((day) => diseaseDataLookup[disease]?.[day] || 0);
      return [`"${disease}"`, ...rowData].join(",");
    });

    // Combine header and data rows
    const csv = [miscellaneousInfo, headerRow_1, headerRow_2, ...dataRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().split("T")[0];
    a.download = `report-${today}.csv`;
    a.click();
  };

  // Download the report in pdf
  const downloadReportInPDF = () => {
    const doc = new jsPDF();

    // Add the additional information before the header
    const additionalInfo = [
      "Facility Name: ________________________________",
      "Ward: ________________________________",
      "Sub-County: ________________________________",
      "County: ________________________________",
      "Month: ________________________________",
      "Year: ________________________________",
    ];

    additionalInfo.forEach((info, index) => {
      doc.text(info, 10, 10 + index * 10);
    });

    // Construct the header row
    const headerRow = ["Disease (First Cases Only)", ...days];

    // Construct data rows
    const dataRows = ailments.map(({ disease }) => {
      const rowData = days.map((day) => diseaseDataLookup[disease]?.[day] || 0);
      return [disease, ...rowData];
    });

    // Add the table to the PDF
    doc.autoTable({
      head: [headerRow],
      body: dataRows,
      startY: 80, // Adjust this value based on the additional info height
    });

    // Save the PDF
    const today = new Date().toISOString().split("T")[0];
    doc.save(`report-${today}.pdf`);
  };
  return (
    <>
      <div className="m-10">
        <div className="flex items-center justify-between no-print">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Official Report
          </h3>

          <div className="mt-8 flex items-center space-x-2">
            <Link href={"/"} className="text-blue-500 underline">
              Home
            </Link>
            <Link
              href={"javascript:void(0)"}
              className="text-blue-500 underline"
              onClick={() => downloadReportInCSV()}
            >
              Print
            </Link>
            {/* Print Requirements */}
            {/* Remove All Headers and Footers */}
            {/* Keep to Only One Page on Landscape */}
            
          </div>
        </div>
        {isLoading && (
          <div className="absolute flex items-center justify-center h-dvh w-dvw no-print">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className={"flex items-center space-x-2 my-2"}>
              <div className="flex items-center space-x-0">
                <span>Facility Name:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
              <div className="flex items-center space-x-0">
                <span>Ward:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
              <div className="flex items-center space-x-0">
                <span>Sub-County:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
              <div className="flex items-center space-x-0">
                <span>County:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
              <div className="flex items-center space-x-0">
                <span>Month:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
              <div className="flex items-center space-x-0">
                <span>Year:</span>
                {/* Underline character */}
                <span>________________________________</span>
              </div>
            </div>
            <Table id="report" className="table-auto border-collapse border">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableCell className="border border-gray-300">
                    Diseases (First Cases Only)
                  </TableCell>
                  {days.map((day) => (
                    <TableCell key={day} className="border border-gray-300">
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ailments.map((ailment) => (
                  <TableRow key={ailment.disease}>
                    {/* <TableCell className="border border-gray-300  min-w-[300px]"> */}
                    <TableCell className="border border-gray-300  min-w-[100px]">
                      {ailment.disease}
                    </TableCell>
                    {days.map((day) => (
                      <TableCell key={day} className="border border-gray-300">
                        {diseaseDataLookup[ailment.disease]
                          ? diseaseDataLookup[ailment.disease][day] || 0
                          : 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </>
  );
};

export default Report;
