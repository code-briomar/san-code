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

  return (
    <>
      <div className="m-10">
        <div className="flex items-center justify-between">
          <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
            Official Report
          </h3>

          <Link href={"/"} className="text-blue-500 underline">
            Home
          </Link>
        </div>
        <Table className="table-auto border-collapse border">
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
                <TableCell className="border border-gray-300 p-1 min-w-[300px]">
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
      </div>
    </>
  );
};

export default Report;
