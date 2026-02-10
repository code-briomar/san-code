"use client";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { aggregateForMOH705 } from "../data/moh705-diseases";
import { MOH_717_SECTIONS, populateSectionA } from "../data/moh717-sections";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * Generate MOH 705B PDF in A3 landscape
 */
export function generateMOH705PDF(reportData, { facilityName, district, month, year }) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A3", // 420 x 297 mm
  });

  const pageWidth = 420;

  // Title block
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("REPUBLIC OF KENYA", pageWidth / 2, 10, { align: "center" });

  doc.setFontSize(10);
  doc.text("MINISTRY OF HEALTH", pageWidth / 2, 16, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "OVER 5 YEARS - DAILY OUTPATIENT MORBIDITY SUMMARY SHEET",
    pageWidth / 2,
    22,
    { align: "center" }
  );

  // Header fields
  doc.setFontSize(8);
  const headerY = 28;
  doc.text(`Facility Name: ${facilityName || "_______________"}`, 10, headerY);
  doc.text(`District/Sub-County: ${district || "_______________"}`, 130, headerY);
  doc.text(`Month: ${month || "_______________"}`, 270, headerY);
  doc.text(`Year: ${year || "_______________"}`, 350, headerY);

  // Build table data
  const { diseaseRows, summaryRows } = aggregateForMOH705(reportData);

  const headerRow = [
    { content: "#", styles: { halign: "center", cellWidth: 8 } },
    { content: "Disease (New Cases Only)", styles: { halign: "left", cellWidth: 55 } },
    ...days.map((d) => ({
      content: String(d),
      styles: { halign: "center", cellWidth: 10 },
    })),
    { content: "TOTAL", styles: { halign: "center", cellWidth: 14, fontStyle: "bold" } },
  ];

  const bodyRows = diseaseRows.map((row) => [
    { content: String(row.number), styles: { halign: "center" } },
    { content: row.name, styles: { halign: "left" } },
    ...days.map((day) => ({
      content: row.days[day] > 0 ? String(row.days[day]) : "",
      styles: { halign: "center" },
    })),
    {
      content: row.total > 0 ? String(row.total) : "",
      styles: { halign: "center", fontStyle: "bold" },
    },
  ]);

  // Summary rows
  const summaryBodyRows = summaryRows.map((row) => [
    { content: "", styles: { halign: "center" } },
    { content: row.label, styles: { halign: "left", fontStyle: "bold" } },
    ...days.map((day) => ({
      content: row.days[day] > 0 ? String(row.days[day]) : "",
      styles: { halign: "center", fontStyle: "bold" },
    })),
    {
      content: row.total > 0 ? String(row.total) : "",
      styles: { halign: "center", fontStyle: "bold" },
    },
  ]);

  const allRows = [...bodyRows, ...summaryBodyRows];

  doc.autoTable({
    head: [headerRow],
    body: allRows,
    startY: 32,
    margin: { top: 8, right: 8, bottom: 20, left: 8 },
    styles: {
      fontSize: 7,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      halign: "center",
      fontSize: 7,
    },
    theme: "grid",
    tableWidth: "auto",
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.text("Completed By (Name): ____________________", 10, finalY);
  doc.text("Designation: ____________________", 130, finalY);
  doc.text("Sign: ____________________", 250, finalY);
  doc.text("Date: ____________________", 340, finalY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MOH 705B", pageWidth - 10, finalY + 6, { align: "right" });

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  doc.save(`sanCode-MOH705B-${stamp}.pdf`);
}

/**
 * Generate MOH 717 PDF in A4 portrait
 */
export function generateMOH717PDF(reportData, { facilityName, district, month, year }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  const pageWidth = 210;

  // Title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("REPUBLIC OF KENYA", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text("MINISTRY OF HEALTH", pageWidth / 2, 22, { align: "center" });
  doc.setFontSize(9);
  doc.text(
    "MONTHLY WORKLOAD REPORT FOR HEALTH FACILITIES (MOH 717)",
    pageWidth / 2,
    29,
    { align: "center" }
  );

  // Header fields
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Facility: ${facilityName || "_______________"}`, 15, 38);
  doc.text(`District/Sub-County: ${district || "_______________"}`, 15, 44);
  doc.text(`Month: ${month || "___________"}`, 120, 38);
  doc.text(`Year: ${year || "___________"}`, 120, 44);

  const autoValues = populateSectionA(reportData);
  let currentY = 54;

  MOH_717_SECTIONS.forEach((section) => {
    // Check for page break
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Section ${section.id}: ${section.title}`, 15, currentY);
    currentY += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    section.fields.forEach((field) => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 15;
      }

      const value = section.autoPopulated ? (autoValues[field.key] ?? 0) : "";
      doc.text(`${field.label}:`, 20, currentY);
      doc.text(String(value), 150, currentY);

      // Underline for the value area
      doc.setDrawColor(0);
      doc.line(145, currentY + 1, 180, currentY + 1);

      currentY += 6;
    });

    currentY += 4;
  });

  // Signature block
  currentY += 4;
  if (currentY > 260) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFontSize(8);
  doc.text("Completed By: ____________________", 15, currentY);
  doc.text("Designation: ____________________", 15, currentY + 6);
  doc.text("Sign: ____________________", 120, currentY);
  doc.text("Date: ____________________", 120, currentY + 6);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MOH 717", pageWidth - 15, currentY + 12, { align: "right" });

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  doc.save(`sanCode-MOH717-${stamp}.pdf`);
}

/**
 * Generate Extended Report PDF in A3 landscape
 */
export function generateExtendedPDF(reportData, ailments) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A3",
  });

  const pageWidth = 420;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("EXTENDED DISEASE REPORT — ALL DISEASES", pageWidth / 2, 10, {
    align: "center",
  });

  const lookup = reportData.reduce((acc, entry) => {
    acc[entry.disease] = entry;
    return acc;
  }, {});

  const headerRow = [
    { content: "#", styles: { halign: "center", cellWidth: 8 } },
    { content: "Disease", styles: { halign: "left", cellWidth: 55 } },
    ...days.map((d) => ({
      content: String(d),
      styles: { halign: "center", cellWidth: 10 },
    })),
    { content: "TOTAL", styles: { halign: "center", cellWidth: 14, fontStyle: "bold" } },
  ];

  const bodyRows = ailments.map((ailment, index) => {
    const entry = lookup[ailment.disease];
    let total = 0;
    const dayCells = days.map((day) => {
      const val = Number(entry?.[day]) || 0;
      total += val;
      return {
        content: val > 0 ? String(val) : "",
        styles: { halign: "center" },
      };
    });

    return [
      { content: String(index + 1), styles: { halign: "center" } },
      { content: ailment.disease, styles: { halign: "left" } },
      ...dayCells,
      {
        content: total > 0 ? String(total) : "",
        styles: { halign: "center", fontStyle: "bold" },
      },
    ];
  });

  doc.autoTable({
    head: [headerRow],
    body: bodyRows,
    startY: 15,
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    styles: {
      fontSize: 7,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      halign: "center",
      fontSize: 7,
    },
    theme: "grid",
    tableWidth: "auto",
  });

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  doc.save(`sanCode-ExtendedReport-${stamp}.pdf`);
}

/**
 * Generate Archived MOH 705 PDF in A3 landscape
 */
export function generateArchivePDF(archiveData, monthLabel) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A3",
  });

  const pageWidth = 420;

  // Title block
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("REPUBLIC OF KENYA", pageWidth / 2, 10, { align: "center" });

  doc.setFontSize(10);
  doc.text("MINISTRY OF HEALTH", pageWidth / 2, 16, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `ARCHIVED REPORT — ${monthLabel}`,
    pageWidth / 2,
    22,
    { align: "center" }
  );

  const { diseaseRows, summaryRows } = aggregateForMOH705(archiveData);

  const headerRow = [
    { content: "#", styles: { halign: "center", cellWidth: 8 } },
    { content: "Disease (New Cases Only)", styles: { halign: "left", cellWidth: 55 } },
    ...days.map((d) => ({
      content: String(d),
      styles: { halign: "center", cellWidth: 10 },
    })),
    { content: "TOTAL", styles: { halign: "center", cellWidth: 14, fontStyle: "bold" } },
  ];

  const bodyRows = diseaseRows.map((row) => [
    { content: String(row.number), styles: { halign: "center" } },
    { content: row.name, styles: { halign: "left" } },
    ...days.map((day) => ({
      content: row.days[day] > 0 ? String(row.days[day]) : "",
      styles: { halign: "center" },
    })),
    {
      content: row.total > 0 ? String(row.total) : "",
      styles: { halign: "center", fontStyle: "bold" },
    },
  ]);

  const summaryBodyRows = summaryRows.map((row) => [
    { content: "", styles: { halign: "center" } },
    { content: row.label, styles: { halign: "left", fontStyle: "bold" } },
    ...days.map((day) => ({
      content: row.days[day] > 0 ? String(row.days[day]) : "",
      styles: { halign: "center", fontStyle: "bold" },
    })),
    {
      content: row.total > 0 ? String(row.total) : "",
      styles: { halign: "center", fontStyle: "bold" },
    },
  ]);

  doc.autoTable({
    head: [headerRow],
    body: [...bodyRows, ...summaryBodyRows],
    startY: 28,
    margin: { top: 8, right: 8, bottom: 20, left: 8 },
    styles: {
      fontSize: 7,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      halign: "center",
      fontSize: 7,
    },
    theme: "grid",
    tableWidth: "auto",
  });

  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.text("Completed By (Name): ____________________", 10, finalY);
  doc.text("Designation: ____________________", 130, finalY);
  doc.text("Sign: ____________________", 250, finalY);
  doc.text("Date: ____________________", 340, finalY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MOH 705B", pageWidth - 10, finalY + 6, { align: "right" });

  const safeMonth = monthLabel.replace(/\s+/g, "-");
  doc.save(`sanCode-Archive-${safeMonth}.pdf`);
}
