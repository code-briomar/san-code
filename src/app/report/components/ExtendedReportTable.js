"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { ailments } from "../../staff/ailments";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

const ExtendedReportTable = ({ reportData, showZeros }) => {
  const displayVal = (val) => (val > 0 ? val : showZeros ? 0 : "");
  const diseaseDataLookup = reportData.reduce((lookup, entry) => {
    lookup[entry.disease] = entry;
    return lookup;
  }, {});

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 print:mb-0 print:text-xs dark:text-gray-200">
        Extended Report — All {ailments.length} Diseases
      </h4>
      <Table className="print-table table-auto border-collapse border border-gray-300 dark:border-gray-600">
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center text-xs w-8 dark:text-gray-200">
              #
            </TableHead>
            <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-left text-xs min-w-[180px] dark:text-gray-200">
              Disease
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
          {ailments.map((ailment, index) => {
            const entry = diseaseDataLookup[ailment.disease];
            let rowTotal = 0;
            const dayValues = days.map((day) => {
              const val = Number(entry?.[day]) || 0;
              rowTotal += val;
              return val;
            });

            return (
              <TableRow key={ailment.disease} className="h-6 print:h-auto dark:hover:bg-gray-800/50">
                <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs dark:text-gray-300">
                  {index + 1}
                </TableCell>
                <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-xs whitespace-nowrap dark:text-gray-300">
                  {ailment.disease}
                </TableCell>
                {dayValues.map((val, i) => (
                  <TableCell
                    key={i}
                    className="border border-gray-300 dark:border-gray-600 px-0.5 py-0 text-center text-xs dark:text-gray-300"
                  >
                    {displayVal(val)}
                  </TableCell>
                ))}
                <TableCell className="border border-gray-300 dark:border-gray-600 px-1 py-0 text-center text-xs font-semibold dark:text-gray-200">
                  {displayVal(rowTotal)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExtendedReportTable;
