"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  Loader,
  ClipboardList,
  AlertTriangle,
  Hospital,
} from "lucide-react";
export default function AdminReportExport({
  todayStats,
  computed,
  hospitalReferrals,
}) {
  const [generating, setGenerating] = useState(false);

  const monthTotal = computed?.monthTotal || 0;
  const topAilment = computed?.topAilment || null;
  const diseases = useMemo(
    () => (computed?.diseaseDistribution || []).slice(0, 5),
    [computed?.diseaseDistribution]
  );
  const weekly = computed?.weeklyComparison || null;

  const outbreaks = todayStats?.outbreaks || [];

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "A4" });
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Weekly Health Report", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${dateStr}`, 105, 27, { align: "center" });

      let y = 40;

      // Summary section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const summaryLines = [
        `Students seen today: ${todayStats?.studentCountToday ?? 0}`,
        `Total visits this month: ${monthTotal}`,
        `Top ailment: ${topAilment ? `${topAilment.name} (${topAilment.count})` : "None"}`,
        `Outbreak alerts: ${outbreaks.length}`,
      ];

      if (weekly) {
        summaryLines.push(
          `This week: ${weekly.thisWeek.visits} visits (${weekly.thisWeek.uniqueStudents} students)`
        );
        summaryLines.push(
          `Last week: ${weekly.lastWeek.visits} visits (${weekly.lastWeek.uniqueStudents} students)`
        );
        if (weekly.percentChange !== null) {
          summaryLines.push(
            `Week-over-week change: ${weekly.percentChange > 0 ? "+" : ""}${weekly.percentChange}%`
          );
        }
      }

      summaryLines.forEach((line) => {
        doc.text(line, 20, y);
        y += 6;
      });

      y += 6;

      // Top Ailments table
      if (diseases.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Top Ailments This Month", 15, y);
        y += 4;

        doc.autoTable({
          startY: y,
          head: [["Ailment", "Cases"]],
          body: diseases.map((d) => [d.name, String(d.value)]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [109, 40, 217] },
          margin: { left: 15, right: 15 },
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      // Outbreak Alerts
      if (outbreaks.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Active Outbreak Alerts", 15, y);
        y += 4;

        doc.autoTable({
          startY: y,
          head: [["Ailment", "Cases"]],
          body: outbreaks.map((o) => [o.ailment, String(o.count)]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [217, 119, 6] },
          margin: { left: 15, right: 15 },
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      // Hospital Referrals
      if (hospitalReferrals?.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Hospital Referrals", 15, y);
        y += 4;

        doc.autoTable({
          startY: y,
          head: [["Adm No", "Name", "Ailment"]],
          body: hospitalReferrals.slice(0, 20).map((r) => [
            String(r.admNo),
            `${r.fName || ""} ${r.sName || ""}`.trim() || "-",
            r.ailment || "-",
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 15, right: 15 },
        });

        y = doc.lastAutoTable.finalY + 10;
      }

      // Signature lines
      y = Math.max(y + 10, 240);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.line(15, y, 80, y);
      doc.text("School Nurse", 15, y + 5);
      doc.line(120, y, 185, y);
      doc.text("Principal / Deputy Principal", 120, y + 5);

      // Save
      const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
      doc.save(`sanCode-WeeklyReport-${stamp}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Weekly Health Report
          </CardTitle>
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Generate PDF
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preview of what will be included in the report:
          </p>

          {/* Summary preview */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-slate-200 dark:border-neutral-800 p-3">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">
                Seen Today
              </p>
              <p className="text-xl font-bold">
                {todayStats?.studentCountToday ?? 0}
              </p>
            </div>
            <div className="rounded border border-slate-200 dark:border-neutral-800 p-3">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">
                Month Total
              </p>
              <p className="text-xl font-bold">{monthTotal}</p>
            </div>
            <div className="rounded border border-slate-200 dark:border-neutral-800 p-3">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">
                Top Ailment
              </p>
              <p className="text-sm font-bold">
                {topAilment ? `${topAilment.name} (${topAilment.count})` : "—"}
              </p>
            </div>
            <div className="rounded border border-slate-200 dark:border-neutral-800 p-3">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">
                Week Visits
              </p>
              <p className="text-xl font-bold">
                {weekly?.thisWeek.visits ?? "—"}
              </p>
            </div>
          </div>

          {/* Top ailments preview */}
          {diseases.length > 0 && (
            <div>
              <p className="text-xs uppercase font-medium text-slate-500 dark:text-slate-400 mb-2">
                Top Ailments
              </p>
              <div className="flex flex-wrap gap-2">
                {diseases.map((d) => (
                  <Badge key={d.name} variant="outline">
                    {d.name}: {d.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Alerts preview */}
          {outbreaks.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {outbreaks.length} outbreak{outbreaks.length !== 1 ? "s" : ""}:
              </span>
              <div className="flex gap-1.5">
                {outbreaks.map((o) => (
                  <Badge
                    key={o.ailment}
                    className="border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-200"
                  >
                    {o.ailment} ({o.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Referrals preview */}
          {hospitalReferrals?.length > 0 && (
            <div className="flex items-center gap-2">
              <Hospital className="h-4 w-4 text-red-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {hospitalReferrals.length} student
                {hospitalReferrals.length !== 1 ? "s" : ""} referred to hospital
              </span>
            </div>
          )}

          {hospitalReferrals === null && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tip: Visit the &ldquo;Alerts & Follow-ups&rdquo; tab first to load
              hospital referral data for the report.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
