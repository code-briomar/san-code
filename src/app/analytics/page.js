"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ailments } from "../staff/ailments";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { base_api } from "@/lib/base_api";

const Analytics = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [seriesData, setSeriesData] = useState([]);
  const [xAxisValues, setXAxisValues] = useState([]);

  const fetchFromReportEndpoint = async (count) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        // `https://sancode-api.onrender.com/report-analytics?page=${count}`
        `${base_api}/report-analytics?page=${count}`
      );

      if (response.ok) {
        const reportData = await response.json();

        if (reportData.length !== 0) {
          setReportData(reportData);
        }
      } else {
        console.error("API ENDPOINT IS DOWN!");
      }
    } catch (error) {
      console.error("An error occurred while fetching the data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const organizeReportData = (data) => {
    const dataValues = data.slice(0, 31);

    const newSeriesData = [];
    for (let i = 0; i < ailments.length; i++) {
      const diseaseDataObject = dataValues.find((currentObject) => {
        return currentObject.disease === ailments[i];
      });

      if (!diseaseDataObject) {
        continue;
      }

      const diseaseData = Object.values(diseaseDataObject);
      newSeriesData.push({
        name: ailments[i],
        type: "bar",
        stack: "report_stack",
        data: diseaseData,
      });

      console.log(newSeriesData);
    }

    setSeriesData(newSeriesData);

    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let numberOfDaysOfMonth = new Date(year, month, 0).getDate() + 1;
    const newXAxisValues = Array.from(
      { length: numberOfDaysOfMonth },
      (_, i) => {
        if (i === 0) {
          return "";
        }
        return String(i);
      }
    );
    setXAxisValues(newXAxisValues);
  };

  useEffect(() => {
    fetchFromReportEndpoint(count);
  }, [count]);

  useEffect(() => {
    organizeReportData(reportData);
  }, [reportData]);

  const increaseButton = useRef();
  const decreaseButton = useRef();

  return (
    <>
      <div className="m-10">
        {isLoading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
                Official Analytics
              </h3>

              <Link href={"/"} className="text-blue-500 underline">
                Home
              </Link>
            </div>
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "cross",
                  },
                  z: 60,
                },
                legend: {
                  data: ailments,
                },
                xAxis: {
                  type: "category",
                  data: xAxisValues,
                  name: "Days",
                  nameLocation: "end",
                  nameRotate: true,
                  boundaryGap: true,
                  nameGap: 15,
                },
                yAxis: {
                  type: "value",
                  name: "Totals",
                  nameLocation: "end",
                  nameRotate: true,
                },
                grid: { left: "3%", right: "4%", padding: 20 },
                series: seriesData,
              }}
              style={{ height: "400px", width: "100%", top: 50 }}
            />

            <ul className="flex items-center m-10 p-8 fixed right-0">
              <Button
                variant={"outline"}
                ref={decreaseButton}
                onClick={() => {
                  count != 1 && count > 0
                    ? setCount((previousCount) => previousCount - 1)
                    : null;
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <li className="mx-10">
                <a href="#!">Page {count}</a>
              </li>

              <Button
                variant={"outline"}
                ref={increaseButton}
                onClick={() => {
                  count < 7
                    ? setCount((previousCount) => previousCount + 1)
                    : null;
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;
