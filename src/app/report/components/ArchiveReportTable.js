"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { devMode } from "@/lib/dev_mode";
import { aggregateForMOH705 } from "../data/moh705-diseases";
import { fetchArchivedMonths, fetchArchivedReport, triggerBackfill } from "../services";

const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

const ArchiveReportTable = ({ showZeros, archiveRef }) => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [message, setMessage] = useState("");

  const displayVal = (val) => (val > 0 ? val : showZeros ? 0 : "");

  useEffect(() => {
    loadMonths();
  }, []);

  // Sync state to parent ref for PDF download
  useEffect(() => {
    if (archiveRef) {
      archiveRef.current = { data: archiveData, month: selectedMonth };
    }
  }, [archiveData, selectedMonth, archiveRef]);

  const loadMonths = async () => {
    setIsLoading(true);
    try {
      const res = await fetchArchivedMonths();
      const monthList = res?.data || [];
      setMonths(monthList);
      if (monthList.length > 0) {
        setSelectedMonth(monthList[0]);
        await loadReport(monthList[0]);
      }
    } catch (error) {
      if (devMode) console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async (month) => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetchArchivedReport(month);
      setArchiveData(res?.data || []);
    } catch (error) {
      if (devMode) console.error(error);
      setArchiveData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = async (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    if (m) await loadReport(m);
  };

  const handleBackfill = async () => {
    const monthInput = prompt(
      "Enter month to backfill (YYYY-MM-DD, first of month).\nExample: 2025-06-01"
    );
    if (!monthInput) return;

    setIsBackfilling(true);
    setMessage("");
    try {
      const res = await triggerBackfill(monthInput);
      const data = res?.data;
      if (data?.skipped) {
        setMessage(`Month ${monthInput} is already archived.`);
      } else if (data?.count === 0) {
        setMessage(`No history data found for ${monthInput}.`);
      } else {
        setMessage(data?.message || "Backfill complete.");
        await loadMonths();
      }
    } catch (error) {
      if (devMode) console.error(error);
      setMessage("Error during backfill.");
    } finally {
      setIsBackfilling(false);
    }
  };

  const formatMonthLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const { diseaseRows, summaryRows } = aggregateForMOH705(archiveData);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4 no-print">
        <label className="text-sm font-medium dark:text-gray-200">Month:</label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
        >
          {months.length === 0 && (
            <option value="">No archived months</option>
          )}
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>
        <button
          onClick={handleBackfill}
          disabled={isBackfilling}
          className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isBackfilling ? "Backfilling..." : "Backfill Past Month"}
        </button>
        {message && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-5 h-5 animate-spin dark:text-gray-300" />
        </div>
      )}

      {!isLoading && archiveData.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No archived data available. Use &quot;Backfill Past Month&quot; to reconstruct reports from history.
        </p>
      )}

      {!isLoading && archiveData.length > 0 && (
        <>
          <div className="text-center mb-2">
            <p className="text-sm font-bold uppercase dark:text-gray-100">Republic of Kenya</p>
            <p className="text-sm font-bold uppercase dark:text-gray-100">Ministry of Health</p>
            <p className="text-xs mt-1 dark:text-gray-300">
              ARCHIVED REPORT — {formatMonthLabel(selectedMonth)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table className="print-table table-auto border-collapse border border-gray-300 dark:border-gray-600">
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-800">
                  <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-center text-xs w-8 dark:text-gray-200">
                    #
                  </TableHead>
                  <TableHead className="border border-gray-300 dark:border-gray-600 px-1 py-0.5 text-left text-xs min-w-[180px] dark:text-gray-200">
                    Disease (New Cases Only)
                  </TableHead>
                  {daysArray.map((day) => (
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
                    {daysArray.map((day) => (
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
                    {daysArray.map((day) => (
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
          </div>
        </>
      )}
    </div>
  );
};

export default ArchiveReportTable;
