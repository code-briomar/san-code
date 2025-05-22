"use client";
import { devMode } from "@/lib/dev_mode";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import DiseaseChart from "./disease-chart";
import { fetchReportData } from "./services";

const Analytics = () => {
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

  return (
    <div className="m-10">
      <div className="flex items-center justify-between">
        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          Official Analytics
        </h3>

        <a href={"/"} className="text-blue-500 underline">
          Home
        </a>
      </div>
      <div className="m-10">
        {isLoading && <Loader className="w-5 h-5 animate-spin" />}
        {!isLoading && <DiseaseChart data={reportData} />}
      </div>
    </div>
  );
};

export default Analytics;
