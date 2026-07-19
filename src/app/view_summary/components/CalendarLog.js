"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Thermometer, 
  Plus, 
  Search,
  User,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchDailyAttendanceLog } from "../services";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarLog() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Fetch visits for the selected month
  useEffect(() => {
    const loadVisits = async () => {
      setIsLoading(true);
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      try {
        const response = await fetchDailyAttendanceLog(monthStr);
        setVisits(response?.data || []);
      } catch (err) {
        console.error("Failed to load visits for calendar:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVisits();
  }, [year, month]);

  // Calendar math
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Group visits by day for quick lookup
  const visitsByDay = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      // v.timestamp format: "YYYY-MM-DD HH:mm:ss"
      if (!v.timestamp) return;
      const datePart = v.timestamp.split(/[ T]/)[0]; // "YYYY-MM-DD"
      const dayNum = parseInt(datePart.split("-")[2], 10);
      if (!map[dayNum]) {
        map[dayNum] = [];
      }
      map[dayNum].push(v);
    });
    return map;
  }, [visits]);

  // Get visits for currently selected day
  const selectedDayVisits = useMemo(() => {
    return visitsByDay[selectedDay] || [];
  }, [visitsByDay, selectedDay]);

  // Filter selected day visits by search query
  const filteredVisits = useMemo(() => {
    if (!searchQuery) return selectedDayVisits;
    const q = searchQuery.toLowerCase();
    return selectedDayVisits.filter(
      (v) =>
        (v.fName && v.fName.toLowerCase().includes(q)) ||
        (v.sName && v.sName.toLowerCase().includes(q)) ||
        (String(v.id).includes(q)) ||
        (v.class && v.class.toLowerCase().includes(q)) ||
        (v.ailment && v.ailment.toLowerCase().includes(q)) ||
        (v.medication && v.medication.toLowerCase().includes(q))
    );
  }, [selectedDayVisits, searchQuery]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // Select 1st day of the new month by default
      setSelectedDay(1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      setSelectedDay(1);
      return newDate;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  // Helper to determine heat map styling based on visit count
  const getCellBg = (count) => {
    if (count === 0) return "bg-slate-50/50 hover:bg-slate-100/70 dark:bg-zinc-900/10 dark:hover:bg-zinc-800/30";
    if (count <= 2) return "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100/50 dark:border-blue-950/50";
    if (count <= 5) return "bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200/70 dark:hover:bg-blue-800/40 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-900/50";
    if (count <= 10) return "bg-blue-200 dark:bg-blue-800/60 hover:bg-blue-300/70 dark:hover:bg-blue-700/50 text-blue-900 dark:text-blue-100 border border-blue-300/50 dark:border-blue-800/50";
    return "bg-blue-600 hover:bg-blue-700 text-white font-semibold";
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Calendar Grid Card */}
      <Card className="lg:col-span-7 border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <CalendarIcon className="w-5 h-5 text-slate-500" />
                <span>Monthly Calendar View</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select a day to view clinical records. Heatmap reflects patient volume.
              </CardDescription>
            </div>
            {/* Calendar Controls */}
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
                {monthName} {year}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-semibold px-2">
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <p className="text-xs text-slate-400">Loading monthly attendance log...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-zinc-900">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty spaces at the start of the month */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-50/10 dark:bg-zinc-950/20 rounded-lg opacity-25" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayVisits = visitsByDay[dayNum] || [];
                  const visitCount = dayVisits.length;
                  const isSelected = selectedDay === dayNum;
                  const isToday = 
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-between p-1.5 relative transition-all duration-150 hover:scale-105 active:scale-95
                        ${getCellBg(visitCount)}
                        ${isSelected 
                          ? "ring-2 ring-slate-800 dark:ring-slate-100 ring-offset-2 dark:ring-offset-zinc-950 scale-105 z-10 border-slate-400" 
                          : "border border-transparent"
                        }
                      `}
                    >
                      {/* Day Number */}
                      <span className={`text-xs font-bold self-start ${visitCount > 10 ? "text-white" : ""}`}>
                        {dayNum}
                      </span>

                      {/* Today Indicator Dot */}
                      {isToday && (
                        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${visitCount > 10 ? "bg-white" : "bg-red-500 animate-pulse"}`} />
                      )}

                      {/* Visit Count Badge */}
                      {visitCount > 0 && (
                        <span 
                          className={`
                            text-[10px] font-extrabold px-1.5 py-0.5 rounded-full self-end
                            ${visitCount > 10 
                              ? "bg-white text-blue-700" 
                              : "bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20"
                            }
                          `}
                        >
                          {visitCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Selected Day Details Card */}
      <Card className="lg:col-span-5 border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm flex flex-col min-h-[450px]">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-900/80">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-md text-slate-900 dark:text-white flex items-center justify-between">
              <span>Day Details</span>
              <Badge variant="secondary" className="font-mono text-xs font-semibold px-2 py-0.5">
                {selectedDay} {monthName} {year}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredVisits.length} of {selectedDayVisits.length} visits
            </CardDescription>
            {/* Search filter in details list */}
            {selectedDayVisits.length > 0 && (
              <div className="relative mt-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search patients, complaints, meds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs border-slate-250 dark:border-zinc-800"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto max-h-[480px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : selectedDayVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-350 dark:text-zinc-650" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Clinic Visits</p>
              <p className="text-xs text-slate-400 max-w-[200px]">
                No students or staff were checked into the sanatorium on this date.
              </p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No visits match your search query.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map((record, index) => {
                const tempVal = parseFloat(record.tempReading);
                let visitTime = "00:00";
                if (record.timestamp) {
                  const parts = record.timestamp.split(/[ T]/);
                  if (parts[1]) {
                    visitTime = parts[1].substring(0, 5);
                  }
                }

                return (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border border-slate-150 dark:border-zinc-900/60 bg-slate-50/50 dark:bg-zinc-900/20 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors space-y-2"
                  >
                    {/* Top Row: Name and Role */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {record.fName} {record.sName}
                        </span>
                        <Badge 
                          variant="outline" 
                          className="text-[9px] uppercase font-extrabold py-0 px-1 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300"
                        >
                          {record.type}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {visitTime}
                      </span>
                    </div>

                    {/* Middle Row: ID/Class & Temp */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded">
                        {record.type === "student" ? `Class: ${record.class}` : `ID: ${record.id}`}
                      </span>
                      {tempVal ? (
                        <span 
                          className={`
                            inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono border
                            ${tempVal >= 37.5 
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" 
                              : "bg-slate-100 dark:bg-zinc-850 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-zinc-800"
                            }
                          `}
                        >
                          <Thermometer className="w-3 h-3" />
                          {tempVal}°C
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Details: Ailment, Complain, Medication */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-zinc-900 text-xs">
                      {record.complain && (
                        <div className="flex items-start gap-1">
                          <span className="text-slate-400 font-medium min-w-[65px]">Complaint:</span>
                          <span className="text-slate-700 dark:text-slate-300 italic">
                            &quot;{record.complain}&quot;
                          </span>
                        </div>
                      )}
                      
                      {record.ailment && (
                        <div className="flex items-start gap-1">
                          <span className="text-slate-400 font-medium min-w-[65px]">Ailment:</span>
                          <span className="text-slate-900 dark:text-white font-medium">
                            {record.ailment}
                          </span>
                        </div>
                      )}

                      {record.medication && (
                        <div className="flex items-start gap-1">
                          <span className="text-slate-400 font-medium min-w-[65px]">Medication:</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1 bg-blue-50/20 dark:bg-blue-950/10 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-900/50 font-semibold">
                            {record.medication}
                          </Badge>
                        </div>
                      )}

                      {/* Hospital Referral Badge */}
                      {record.going_to_hospital === 1 && (
                        <div className="pt-1 flex">
                          <Badge className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold py-0.5 px-2 uppercase tracking-wide">
                            Referred to Hospital
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
