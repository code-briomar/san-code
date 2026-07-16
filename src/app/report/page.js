"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { devMode } from "@/lib/dev_mode";
import { base_api } from "@/lib/base_api";
import { Button } from "@/components/ui/button";
import { Loader, Printer, FileDown, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { updateReport } from "../services";
import { ailments } from "../staff/ailments";
import { fetchReportData } from "./services";
import MOH705Table from "./components/MOH705Table";
import ExtendedReportTable from "./components/ExtendedReportTable";
import MOH717Form from "./components/MOH717Form";
import ArchiveReportTable from "./components/ArchiveReportTable";
import {
  generateMOH705PDF,
  generateMOH717PDF,
  generateExtendedPDF,
  generateArchivePDF,
} from "./components/PDFGenerator";

const Report = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("moh705");
  const [showZeros, setShowZeros] = useState(false);
  const archiveRef = useRef({ data: [], month: "" });

  // Editable header fields
  const [facilityName, setFacilityName] = useState("");
  const [district, setDistrict] = useState("");
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const fetchFromReportEndpoint = async () => {
    setIsLoading(true);
    try {
      const updateReportResponse = await updateReport();
      if (devMode) console.log(updateReportResponse);
      const response = await fetchReportData();
      if (devMode) console.log(response);
      setReportData(response?.data || []);
    } catch (error) {
      if (devMode) {
        console.error("An error occurred while fetching the data: ", error);
      }
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    if (reportData.length === 0) {
      fetchFromReportEndpoint();
    }
  }, []);

  const handleDownloadPDF = () => {
    const opts = { facilityName, district, month, year };
    if (activeTab === "moh705") {
      generateMOH705PDF(reportData, opts);
    } else if (activeTab === "extended") {
      generateExtendedPDF(reportData, ailments);
    } else if (activeTab === "moh717") {
      generateMOH717PDF(reportData, opts);
    } else if (activeTab === "archive") {
      const { data, month: archiveMonth } = archiveRef.current;
      if (data.length === 0) return;
      const label = new Date(archiveMonth).toLocaleString("default", { month: "long", year: "numeric" });
      generateArchivePDF(data, label);
    }
  };

  const handlePrint = () => {
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    const originalTitle = document.title;
    document.title = `sanCode-${stamp}`;
    window.print();
    document.title = originalTitle;
  };

  const handleExcelDownload = () => {
    const baseURL = base_api.defaults.baseURL;
    window.open(baseURL + "/export-report-excel", "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 no-print">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
            className="rounded-full shadow-sm hover:scale-105 transition-transform border-zinc-300 dark:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Official Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450">
              Generate, print, and export MOH report forms
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 border-zinc-300 dark:border-zinc-800 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExcelDownload}
            className="flex items-center gap-1.5 border-zinc-300 dark:border-zinc-800 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 border-zinc-350 dark:border-zinc-850 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>

          <div className="border-l border-zinc-200 dark:border-zinc-800 h-6 mx-1 hidden sm:block"></div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-150">
            <input
              type="checkbox"
              checked={showZeros}
              onChange={(e) => setShowZeros(e.target.checked)}
              className="accent-slate-900 dark:accent-slate-100 w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-800 cursor-pointer"
            />
            <span>Show zeros</span>
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 no-print">
          <Loader className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />
        </div>
      )}

      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="no-print flex w-full md:w-auto overflow-x-auto bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 mb-6">
            <TabsTrigger value="moh705" className="px-5 py-1.5 text-xs font-medium">MOH 705</TabsTrigger>
            <TabsTrigger value="extended" className="px-5 py-1.5 text-xs font-medium">Extended Report</TabsTrigger>
            <TabsTrigger value="moh717" className="px-5 py-1.5 text-xs font-medium">MOH 717</TabsTrigger>
            <TabsTrigger value="archive" className="px-5 py-1.5 text-xs font-medium">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="moh705" className="outline-none">
            <div className="overflow-x-auto print-overflow-visible">
              <MOH705Table
                reportData={reportData}
                showZeros={showZeros}
                facilityName={facilityName}
                setFacilityName={setFacilityName}
                district={district}
                setDistrict={setDistrict}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
              />
            </div>
          </TabsContent>

          <TabsContent value="extended" className="outline-none">
            <div className="overflow-x-auto print-overflow-visible">
              <ExtendedReportTable reportData={reportData} showZeros={showZeros} />
            </div>
          </TabsContent>

          <TabsContent value="moh717" className="outline-none">
            <MOH717Form
              reportData={reportData}
              facilityName={facilityName}
              district={district}
              month={month}
              year={year}
            />
          </TabsContent>

          <TabsContent value="archive" className="outline-none">
            <div className="overflow-x-auto print-overflow-visible">
              <ArchiveReportTable showZeros={showZeros} archiveRef={archiveRef} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Report;
