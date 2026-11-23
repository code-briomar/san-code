"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Stethoscope,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Play,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  UserCheck,
  Loader2
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function RollCallModal({
  open,
  onClose,
  className,
  teacherName,
  students = [],
  passcode,
  onSaveSuccess,
  initialResumeIndex = 0,
  initialRecords = null
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const draftStorageKey = `sancode_attendance_draft_${className}`;

  // Stages: "start_confirm" | "calling" | "review_summary"
  const [stage, setStage] = useState(initialResumeIndex > 0 ? "calling" : "start_confirm");
  const [currentIndex, setCurrentIndex] = useState(initialResumeIndex);
  const [records, setRecords] = useState([]); // [ { admNo, fullName, house, status, remarks, clinicVisitToday, clinicDetails, isHospitalReferred } ]
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentRemark, setCurrentRemark] = useState("");

  // Initialize records from students or initialRecords
  useEffect(() => {
    if (initialRecords && initialRecords.length > 0) {
      setRecords(initialRecords);
    } else if (students && students.length > 0) {
      const initialized = students.map(s => ({
        admNo: s.admNo,
        fullName: s.fullName || `${s.fName || ""} ${s.sName || ""} ${s.tName || ""} ${s.fourthName || ""}`.trim(),
        house: s.house || "—",
        status: s.status || "present",
        remarks: s.remarks || (s.clinicVisitToday ? "At Sanatorium" : ""),
        clinicVisitToday: !!s.clinicVisitToday,
        clinicDetails: s.clinicDetails || null,
        isHospitalReferred: !!s.isHospitalReferred
      }));
      setRecords(initialized);
    }

    if (initialResumeIndex > 0) {
      setCurrentIndex(initialResumeIndex);
      setStage("calling");
    } else {
      setStage("start_confirm");
      setCurrentIndex(0);
    }
  }, [students, initialRecords, initialResumeIndex, open]);

  // Sync current student's remark to local input
  useEffect(() => {
    if (records[currentIndex]) {
      setCurrentRemark(records[currentIndex].remarks || "");
    }
  }, [currentIndex, records]);

  // Auto-save draft to localStorage whenever records or currentIndex updates
  const saveDraftToLocalStorage = (newRecords, nextIdx, isComplete = false) => {
    try {
      const draft = {
        className,
        date: todayStr,
        timestamp: Date.now(),
        currentIndex: nextIdx,
        totalStudents: newRecords.length,
        records: newRecords,
        isCompleted: isComplete
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch (err) {
      console.warn("Failed to write attendance draft to localStorage:", err);
    }
  };

  // Mark student status and advance
  const handleMarkStatus = (status) => {
    if (!records[currentIndex]) return;

    let autoRemark = currentRemark;
    if (status === "medical" && !autoRemark && records[currentIndex].clinicVisitToday) {
      autoRemark = "At Sanatorium";
    }

    const updated = [...records];
    updated[currentIndex] = {
      ...updated[currentIndex],
      status,
      remarks: autoRemark
    };
    setRecords(updated);

    const nextIndex = currentIndex + 1;
    if (nextIndex < records.length) {
      setCurrentIndex(nextIndex);
      saveDraftToLocalStorage(updated, nextIndex, false);
    } else {
      // Reached the end!
      saveDraftToLocalStorage(updated, nextIndex, true);
      setStage("review_summary");
    }
  };

  const handleRemarkChange = (val) => {
    setCurrentRemark(val);
    if (records[currentIndex]) {
      const updated = [...records];
      updated[currentIndex] = {
        ...updated[currentIndex],
        remarks: val
      };
      setRecords(updated);
    }
  };

  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      saveDraftToLocalStorage(records, prevIdx, false);
    }
  };

  const handleNextStudent = () => {
    if (currentIndex < records.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveDraftToLocalStorage(records, nextIdx, false);
    } else {
      setStage("review_summary");
    }
  };

  const handleMarkAllPresentQuick = () => {
    const allPresent = records.map(s => ({ ...s, status: "present" }));
    setRecords(allPresent);
    saveDraftToLocalStorage(allPresent, allPresent.length, true);
    setStage("review_summary");
  };

  // Generate Official PDF using jsPDF and jspdf-autotable
  const handleDownloadPDF = () => {
    if (!records.length) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // School Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ALLIANCE HIGH SCHOOL", pageWidth / 2, 16, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("DAILY CLASS ATTENDANCE REGISTER", pageWidth / 2, 22, { align: "center" });

    // Class Metadata Box
    doc.setFontSize(9);
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 248, 250);
    doc.roundedRect(14, 27, pageWidth - 28, 20, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.text(`Class: Grade ${className}`, 18, 33);
    doc.text(`Class Teacher: ${teacherName || "WALTER OCHIENG OPONDO"}`, 18, 39);
    doc.text(`Date: ${todayStr}`, pageWidth - 60, 33);
    doc.text(`Academic Year: 2026`, pageWidth - 60, 39);

    // Summary KPIs
    let present = 0, absent = 0, late = 0, medical = 0, excused = 0;
    records.forEach(s => {
      if (s.status === "present") present++;
      else if (s.status === "absent") absent++;
      else if (s.status === "late") late++;
      else if (s.status === "medical") medical++;
      else if (s.status === "excused") excused++;
    });
    const total = records.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      `Summary: Total: ${total}  |  Present: ${present}  |  Absent: ${absent}  |  Late: ${late}  |  Medical: ${medical}  |  Attendance Rate: ${rate}%`,
      18,
      44
    );

    // Table of Students
    const tableRows = records.map((s, idx) => [
      idx + 1,
      s.admNo,
      s.fullName,
      s.house || "—",
      s.status.toUpperCase(),
      s.remarks || (s.clinicVisitToday ? "At Sanatorium" : "")
    ]);

    doc.autoTable({
      startY: 50,
      head: [["#", "Adm No", "Student Name", "House", "Status", "Remarks"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: function(data) {
        if (data.section === "body" && data.column.index === 4) {
          const val = String(data.cell.raw).toUpperCase();
          if (val === "PRESENT") {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "ABSENT") {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "LATE") {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "MEDICAL") {
            data.cell.styles.textColor = [147, 51, 234];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    // Signature Footer
    const finalY = doc.lastAutoTable.finalY + 12;
    if (finalY < 270) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Teacher's Signature: ____________________________", 18, finalY);
      doc.text("Principal / Dean Stamp: ____________________________", pageWidth - 100, finalY);
    }

    doc.save(`Attendance_Grade_${className}_${todayStr}.pdf`);
  };

  // Submit Final Attendance to Supabase API
  const handleSubmitFinal = async () => {
    setSaving(true);
    try {
      const payload = {
        date: todayStr,
        session: "daily",
        taken_by: teacherName || "Class Teacher",
        is_completed: true,
        records: records.map(s => ({
          admNo: s.admNo,
          status: s.status,
          remarks: s.remarks
        }))
      };

      if (onSaveSuccess) {
        await onSaveSuccess(payload);
      }

      // Clear draft since it is successfully completed and submitted
      localStorage.removeItem(draftStorageKey);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Failed to submit attendance:", err);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = records[currentIndex];
  const progressPercent = records.length > 0 ? Math.round(((currentIndex + 1) / records.length) * 100) : 0;

  // Compute live review summary counts
  const summaryCounts = {
    total: records.length,
    present: records.filter(s => s.status === "present").length,
    absent: records.filter(s => s.status === "absent").length,
    late: records.filter(s => s.status === "late").length,
    medical: records.filter(s => s.status === "medical").length,
    excused: records.filter(s => s.status === "excused").length,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-2xl">
        
        {/* ============================================================ */}
        {/* STAGE 1: CONFIRM START PROMPT */}
        {/* ============================================================ */}
        {stage === "start_confirm" && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ClipboardCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Start calling attendance?
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Ready to take roll call for <span className="font-semibold text-zinc-800 dark:text-zinc-200">Grade {className}</span>?
              </p>
            </div>

            {/* Class Info Box */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Date:</span>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{todayStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Class Teacher:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{teacherName || "WALTER OCHIENG OPONDO"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Enrolled:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{records.length} students</span>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                💡 Progress is automatically saved as you go. If you are interrupted, you can pick up from where you left off anytime today.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={() => setStage("calling")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-sm shadow-md gap-2"
              >
                <Play className="h-4 w-4 fill-white" />
                Start Roll Call
              </Button>
              <Button
                variant="ghost"
                onClick={handleMarkAllPresentQuick}
                className="w-full text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Quick shortcut: Mark all present & review
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: STEP-BY-STEP CALLING LOOP */}
        {/* ============================================================ */}
        {stage === "calling" && currentStudent && (
          <div className="flex flex-col">
            {/* Top Bar: Progress & Pause */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Student {currentIndex + 1} of {records.length}
                </div>
                <div className="w-28 bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">{progressPercent}%</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-7 px-2.5 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                title="Progress saved in draft"
              >
                Pause & Exit
              </Button>
            </div>

            {/* Student Calling Card */}
            <div className="p-6 sm:p-8 space-y-6 text-center">
              {/* Student Identity */}
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs font-mono font-bold text-zinc-500 border-zinc-200 dark:border-zinc-800">
                  Roll #{currentIndex + 1}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                  {currentStudent.fullName}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">Adm: {currentStudent.admNo}</span>
                  <span>•</span>
                  <span>House: {currentStudent.house || "—"}</span>
                </div>
              </div>

              {/* Clinic / Sanatorium Alert (If student attended clinic today) */}
              {currentStudent.clinicVisitToday && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-lg text-left text-xs flex items-start gap-2.5 text-purple-900 dark:text-purple-300">
                  <Stethoscope className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Visited Sanatorium Today</p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400">
                      Symptoms: {currentStudent.clinicDetails?.complain || "Reported ill"} | Ailment: {currentStudent.clinicDetails?.ailment || "General checkup"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkStatus("medical")}
                    className="h-6 text-[10px] bg-white dark:bg-zinc-900 text-purple-700 border-purple-300"
                  >
                    Mark Medical
                  </Button>
                </div>
              )}

              {currentStudent.isHospitalReferred && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-left text-xs flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                  <p className="font-bold">Student has an active Hospital Referral</p>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleMarkStatus("present")}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-xs group cursor-pointer"
                  >
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 group-hover:text-white mb-1" />
                    <span className="text-sm font-bold">Present</span>
                    <span className="text-[10px] text-emerald-600 group-hover:text-white opacity-80">(Key: P)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus("absent")}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-rose-500 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-xs group cursor-pointer"
                  >
                    <XCircle className="h-6 w-6 text-rose-600 group-hover:text-white mb-1" />
                    <span className="text-sm font-bold">Absent</span>
                    <span className="text-[10px] text-rose-600 group-hover:text-white opacity-80">(Key: A)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus("late")}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 dark:hover:bg-amber-600 dark:hover:text-white transition-all shadow-xs group cursor-pointer"
                  >
                    <Clock className="h-6 w-6 text-amber-600 group-hover:text-white mb-1" />
                    <span className="text-sm font-bold">Late</span>
                    <span className="text-[10px] text-amber-600 group-hover:text-white opacity-80">(Key: L)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleMarkStatus("medical")}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-600 hover:text-white dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Medical / Sanatorium
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus("excused")}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    Excused / Official
                  </button>
                </div>
              </div>

              {/* Optional Remark Input */}
              <div className="pt-2">
                <Input
                  placeholder="Optional remark (e.g. parent called, sports match)..."
                  value={currentRemark}
                  onChange={(e) => handleRemarkChange(e.target.value)}
                  className="text-xs h-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              {/* Prev / Next Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevStudent}
                  disabled={currentIndex === 0}
                  className="text-xs gap-1 text-zinc-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-[11px] text-zinc-400">
                  Current Status: <span className="font-bold uppercase text-zinc-800 dark:text-zinc-200">{currentStudent.status}</span>
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextStudent}
                  className="text-xs gap-1 text-zinc-500"
                >
                  {currentIndex === records.length - 1 ? "Finish" : "Skip / Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: REVIEW & PDF EXPORT SCREEN */}
        {/* ============================================================ */}
        {stage === "review_summary" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Roll call completed!
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All {records.length} students have been checked. Review the summary below before final submission.
              </p>
            </div>

            {/* Quick Summary Numbers */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Present</p>
                <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">{summaryCounts.present}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Absent</p>
                <p className="text-xl font-extrabold text-rose-800 dark:text-rose-300">{summaryCounts.absent}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Late</p>
                <p className="text-xl font-extrabold text-amber-800 dark:text-amber-300">{summaryCounts.late}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">Medical</p>
                <p className="text-xl font-extrabold text-purple-800 dark:text-purple-300">{summaryCounts.medical}</p>
              </div>
            </div>

            {/* Exceptions List (Absent, Late, Medical) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Exceptions & Noteworthy (Absent / Late / Medical):
              </p>
              {records.filter(s => s.status !== "present").length === 0 ? (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
                  🌟 Perfect Attendance! Every student in Grade {className} is present today.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {records.filter(s => s.status !== "present").map(s => (
                    <div
                      key={s.admNo}
                      className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold">{s.fullName}</span> (Adm: {s.admNo}, House: {s.house})
                        {s.remarks && <p className="text-[11px] text-zinc-500 italic">"{s.remarks}"</p>}
                      </div>
                      <Badge className={`text-[10px] capitalize ${
                        s.status === "absent" ? "bg-rose-100 text-rose-800" :
                        s.status === "late" ? "bg-amber-100 text-amber-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {saveSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Register Submitted Successfully!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 h-9 text-xs gap-1.5 font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Official PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-9 text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitFinal}
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save & Submit Register
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="h-10 text-xs gap-1.5 border-zinc-200 dark:border-zinc-800 font-semibold"
                  >
                    <Download className="h-4 w-4 text-zinc-500" />
                    Download PDF
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentIndex(0);
                    setStage("calling");
                  }}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-800"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Review / Edit from start
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
