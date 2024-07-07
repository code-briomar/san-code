// components/DiseaseChart.js
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DiseaseChart = ({ data, pageSize = 1 }) => {
  const chartRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(31 / pageSize);

  const getCurrentPageData = () => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return {
      xAxisData: Array.from({ length: 31 }, (_, i) => (i + 1).toString()).slice(
        start,
        end
      ),
      seriesData: data.map((diseaseData) => ({
        ...diseaseData,
        data: Array.from(
          { length: 31 },
          (_, i) => diseaseData[(i + 1).toString()]
        ).slice(start, end),
      })),
    };
  };

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);
    const { xAxisData, seriesData } = getCurrentPageData();
    const option = {
      backgroundColor: "#f9f9f9", // Light background color for an Apple-like look
      //   title: {
      //     text: "Disease Data",
      //     left: "center",
      //     textStyle: {
      //       color: "#333",
      //       fontFamily: "Helvetica, Arial, sans-serif",
      //       fontSize: 18,
      //       fontWeight: "bold",
      //     },
      //   },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        textStyle: {
          color: "#333",
        },
      },
      legend: {
        type: "scroll", // Scrollable legend
        data: data.map((item) => item.disease),
        bottom: "10",
        textStyle: {
          color: "#333",
        },
      },
      grid: {
        left: "10%",
        right: "10%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true, // Ensure bars start and end at categories
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: "#6e7079",
          },
        },
        axisLabel: {
          color: "#6e7079",
        },
      },
      yAxis: {
        type: "value",
        boundaryGap: [0, 0.1], // Adjust y-axis boundary gap if needed
        axisLine: {
          lineStyle: {
            color: "#6e7079",
          },
        },
        axisLabel: {
          color: "#6e7079",
        },
      },
      series: seriesData
        .filter((diseaseData) => diseaseData.data.some((value) => value > 0)) // Filter series data with values > 0
        .map((diseaseData) => ({
          name: diseaseData.disease,
          type: "bar",
          colorBy: "series",
          data: diseaseData.data,
          itemStyle: {
            borderRadius: [5, 5, 0, 0], // Rounded top corners for a modern look
            shadowBlur: 5,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        })),
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, [data, currentPage, pageSize]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  // Set the current page to today's date as a number to be default
  useEffect(() => {
    setCurrentPage(new Date().getDate() - 1);
  }, []);

  return (
    <div>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }} />
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Button
          variant={"outline"}
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold tracking-loose mx-3">
          Day {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant={"outline"}
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default DiseaseChart;
