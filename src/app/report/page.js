"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { devMode } from "@/lib/dev_mode";
import { base_api } from "@/lib/base_api";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      setTimeout(() => setIsLoading(false), 1000);
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
    <div className="m-4 md:m-10">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 no-print">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight dark:text-gray-100">
          Official Report
        </h3>
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-blue-500 dark:text-blue-400 underline text-sm">
            Home
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="text-blue-500 dark:text-blue-400 underline text-sm"
          >
            Download PDF
          </button>
          <button
            onClick={handleExcelDownload}
            className="text-blue-500 dark:text-blue-400 underline text-sm"
          >
            Excel
          </button>
          <button
            onClick={handlePrint}
            className="text-blue-500 dark:text-blue-400 underline text-sm"
          >
            Print
          </button>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none dark:text-gray-300">
            <input
              type="checkbox"
              checked={showZeros}
              onChange={(e) => setShowZeros(e.target.checked)}
              className="accent-blue-500"
            />
            Show zeros
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64 no-print">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="no-print mb-4">
            <TabsTrigger value="moh705">MOH 705</TabsTrigger>
            <TabsTrigger value="extended">Extended Report</TabsTrigger>
            <TabsTrigger value="moh717">MOH 717</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="moh705">
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

          <TabsContent value="extended">
            <div className="overflow-x-auto print-overflow-visible">
              <ExtendedReportTable reportData={reportData} showZeros={showZeros} />
            </div>
          </TabsContent>

          <TabsContent value="moh717">
            <MOH717Form
              reportData={reportData}
              facilityName={facilityName}
              district={district}
              month={month}
              year={year}
            />
          </TabsContent>

          <TabsContent value="archive">
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
