"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { aggregateForMOH705 } from "../data/moh705-diseases";
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

const MOH705Table = ({ reportData, showZeros, facilityName, setFacilityName, district, setDistrict, month, setMonth, year, setYear }) => {
  const displayVal = (val) => (val > 0 ? val : showZeros ? 0 : "");
  const { diseaseRows, summaryRows } = aggregateForMOH705(reportData);

  return (
    <div className="moh705-print-area">
      <ReportHeader
        facilityName={facilityName}
        setFacilityName={setFacilityName}
        district={district}
        setDistrict={setDistrict}
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
      />

      <Table className="print-table table-auto border-collapse border border-gray-300 dark:border-gray-600">
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center text-xs w-8 dark:text-gray-200">
              #
            </TableHead>
            <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-left text-xs min-w-[180px] dark:text-gray-200">
              Disease (New Cases Only)
            </TableHead>
            {days.map((day) => (
              <TableHead
                key={day}
                className="border border-gray-300 dark:border-gray-600 px-0.5 py-0.5 text-center text-xs w-7 dark:text-gray-200"
              >
                {day}
              </TableHead>
            ))}
            <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center text-xs font-bold w-12 dark:text-gray-200">
              TOTAL
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diseaseRows.map((row) => (
            <TableRow key={row.number} className="h-6 print:h-auto dark:hover:bg-gray-800/50">
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs dark:text-gray-300">
                {row.number}
              </TableCell>
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-xs whitespace-nowrap dark:text-gray-300">
                {row.name}
              </TableCell>
              {days.map((day) => (
                <TableCell
                  key={day}
                  className="border border-gray-300 dark:border-gray-600 px-0.5 py-0 text-center text-xs dark:text-gray-300"
                >
                  {displayVal(row.days[day])}
                </TableCell>
              ))}
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs font-semibold dark:text-gray-200">
                {displayVal(row.total)}
              </TableCell>
            </TableRow>
          ))}

          {/* Summary rows */}
          {summaryRows.map((row, idx) => (
            <TableRow key={`summary-${idx}`} className="h-6 print:h-auto bg-gray-50 dark:bg-gray-800/80 font-bold">
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs font-bold">
              </TableCell>
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-xs font-bold whitespace-nowrap dark:text-gray-100">
                {row.label}
              </TableCell>
              {days.map((day) => (
                <TableCell
                  key={day}
                  className="border border-gray-300 dark:border-gray-600 px-0.5 py-0 text-center text-xs font-bold dark:text-gray-100"
                >
                  {displayVal(row.days[day])}
                </TableCell>
              ))}
              <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs font-bold dark:text-gray-100">
                {displayVal(row.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReportFooter />
    </div>
  );
};

export default MOH705Table;
