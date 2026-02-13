/**
 * Data transformation utilities for analytics dashboard.
 *
 * Report data shape: [{ disease: string, "1": number, "2": number, ... "31": number }]
 */

/** Sum all diseases per day → [{ day: 1, total: 14 }, ...] */
export function computeDailyTotals(reportData) {
  if (!reportData?.length) return [];
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const total = reportData.reduce(
      (sum, row) => sum + (Number(row[String(day)]) || 0),
      0
    );
    return { day, total };
  });
}

/** Same shape but filtered to a single disease */
export function computeDailyTotalsForDisease(reportData, name) {
  if (!reportData?.length || !name) return [];
  const row = reportData.find((r) => r.disease === name);
  if (!row) return [];
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return { day, total: Number(row[String(day)]) || 0 };
  });
}

/** Top 10 diseases + "Other" bucket for donut chart → [{ name, value }] */
export function computeDiseaseDistribution(reportData) {
  if (!reportData?.length) return [];

  const totals = reportData.map((row) => {
    let sum = 0;
    for (let d = 1; d <= 31; d++) sum += Number(row[String(d)]) || 0;
    return { name: row.disease, value: sum };
  });

  // Remove zero-total diseases and sort descending
  const nonZero = totals.filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  if (nonZero.length <= 10) return nonZero;

  const top10 = nonZero.slice(0, 10);
  const otherValue = nonZero.slice(10).reduce((s, d) => s + d.value, 0);
  if (otherValue > 0) top10.push({ name: "Other", value: otherValue });
  return top10;
}

/** Single number: total visits across all diseases for the month */
export function computeMonthTotal(reportData) {
  if (!reportData?.length) return 0;
  return reportData.reduce((total, row) => {
    for (let d = 1; d <= 31; d++) total += Number(row[String(d)]) || 0;
    return total;
  }, 0);
}

/** { name, count } of the highest-total disease, or null */
export function computeTopAilment(reportData) {
  if (!reportData?.length) return null;

  let best = null;
  for (const row of reportData) {
    let sum = 0;
    for (let d = 1; d <= 31; d++) sum += Number(row[String(d)]) || 0;
    if (sum > 0 && (!best || sum > best.count)) {
      best = { name: row.disease, count: sum };
    }
  }
  return best;
}

/** Disease names that have at least one non-zero day (for dropdown filter) */
export function getActiveDiseases(reportData) {
  if (!reportData?.length) return [];
  return reportData
    .filter((row) => {
      for (let d = 1; d <= 31; d++) {
        if ((Number(row[String(d)]) || 0) > 0) return true;
      }
      return false;
    })
    .map((row) => row.disease)
    .sort((a, b) => a.localeCompare(b));
}

/* ── Student-record-based utilities ────────────────────────────────────────── */
/* Records shape: [{ admNo, timestamp: "YYYY-MM-DD HH:mm:ss", ailment, ... }] */

/**
 * Bucket visits by hour of day (0-23) → [{ hour: 0, count: 2 }, ...]
 * Filters to current month by default.
 */
export function computePeakHours(records) {
  if (!records?.length) return [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const buckets = new Array(24).fill(0);
  for (const r of records) {
    const d = new Date(r.timestamp);
    if (d >= monthStart) {
      buckets[d.getHours()]++;
    }
  }

  return buckets.map((count, hour) => ({ hour, count }));
}

/**
 * Find students who returned within `windowDays` for the same ailment.
 * Returns [{ admNo, ailment, firstVisit, returnVisit, daysBetween }]
 * sorted by most recent return first.
 */
export function computeReadmissions(records, windowDays = 7) {
  if (!records?.length) return [];

  // Group by (admNo, ailment) — normalise ailment to lowercase
  const groups = {};
  for (const r of records) {
    const ailment = (r.ailment || "").toLowerCase();
    if (!ailment) continue;
    const key = `${r.admNo}__${ailment}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  const readmissions = [];

  for (const visits of Object.values(groups)) {
    if (visits.length < 2) continue;

    // Sort chronologically
    visits.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (let i = 1; i < visits.length; i++) {
      const prev = new Date(visits[i - 1].timestamp);
      const curr = new Date(visits[i].timestamp);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1 && diffDays <= windowDays) {
        readmissions.push({
          admNo: visits[i].admNo,
          ailment: visits[i].ailment,
          firstVisit: visits[i - 1].timestamp,
          returnVisit: visits[i].timestamp,
          daysBetween: diffDays,
        });
      }
    }
  }

  return readmissions.sort(
    (a, b) => new Date(b.returnVisit) - new Date(a.returnVisit)
  );
}

/* ── New analytics utilities ───────────────────────────────────────────────── */

/** Attendance impact: student-days affected this week/month + chronic students */
export function computeAttendanceImpact(records) {
  if (!records?.length)
    return { weekStudentDays: 0, monthStudentDays: 0, chronicStudents: [] };

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekDays = new Set();
  const monthDays = new Set();
  const monthVisitsByStudent = {};

  for (const r of records) {
    const d = new Date(r.timestamp);
    const dateStr = d.toISOString().split("T")[0];
    const key = `${r.admNo}_${dateStr}`;

    if (d >= monthStart) {
      monthDays.add(key);
      monthVisitsByStudent[r.admNo] =
        (monthVisitsByStudent[r.admNo] || 0) + 1;
    }
    if (d >= weekStart) {
      weekDays.add(key);
    }
  }

  const chronicStudents = Object.entries(monthVisitsByStudent)
    .filter(([, count]) => count >= 3)
    .map(([admNo, count]) => ({ admNo, count }))
    .sort((a, b) => b.count - a.count);

  return {
    weekStudentDays: weekDays.size,
    monthStudentDays: monthDays.size,
    chronicStudents,
  };
}

/** Disease-specific suggested actions */
const DISEASE_ACTIONS = {
  malaria: [
    "Schedule fumigation around school",
    "Distribute mosquito nets to affected dormitories",
    "Health education on malaria prevention",
  ],
  flu: [
    "Encourage frequent hand washing",
    "Consider temporary isolation of affected students",
    "Ensure classrooms are well ventilated",
  ],
  typhoid: [
    "Check water sources and purification",
    "Reinforce handwashing after toilet use",
    "Review cafeteria food handling and hygiene",
  ],
  diarrhea: [
    "Check water and food hygiene",
    "Ensure handwashing stations are stocked with soap",
    "Review sanitation facilities",
  ],
  cholera: [
    "Immediate water source testing",
    "Enforce boiling of drinking water",
    "Notify county health officer",
  ],
  "chest infection": [
    "Check for damp/dusty classroom conditions",
    "Ensure proper ventilation",
    "Refer severe cases to hospital",
  ],
  headache: [
    "Check for dehydration — ensure water access",
    "Monitor for stress or vision issues",
    "Review classroom lighting and ventilation",
  ],
};

const DEFAULT_ACTIONS = [
  "Monitor affected students closely",
  "Inform school administration",
  "Consider a health education session",
];

/** Enhance outbreaks with suggested actions + class breakdown */
export function getActionableAlertData(outbreaks, records) {
  if (!outbreaks?.length) return [];

  return outbreaks.map((outbreak) => {
    const ailmentLower = outbreak.ailment.toLowerCase();

    const matchedKey = Object.keys(DISEASE_ACTIONS).find((k) =>
      ailmentLower.includes(k)
    );
    const actions = DISEASE_ACTIONS[matchedKey] || DEFAULT_ACTIONS;

    const classBreakdown = {};
    if (records?.length) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(6, 0, 0, 0);

      for (const r of records) {
        if (
          (r.ailment || "").toLowerCase() === ailmentLower &&
          new Date(r.timestamp) >= yesterday
        ) {
          const cls = r.class || "Unknown";
          classBreakdown[cls] = (classBreakdown[cls] || 0) + 1;
        }
      }
    }

    return { ...outbreak, actions, classBreakdown };
  });
}

/** Group student records by class for the current month */
export function computeClassBreakdown(records) {
  if (!records?.length) return [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const classStats = {};

  for (const r of records) {
    const d = new Date(r.timestamp);
    if (d < monthStart) continue;

    const cls = r.class || "Unknown";
    if (!classStats[cls]) {
      classStats[cls] = {
        className: cls,
        visits: 0,
        uniqueStudents: new Set(),
        ailments: {},
      };
    }
    classStats[cls].visits++;
    classStats[cls].uniqueStudents.add(r.admNo);
    const ailment = (r.ailment || "unknown").toLowerCase();
    classStats[cls].ailments[ailment] =
      (classStats[cls].ailments[ailment] || 0) + 1;
  }

  return Object.values(classStats)
    .map((c) => ({
      className: c.className,
      visits: c.visits,
      uniqueStudents: c.uniqueStudents.size,
      topAilment:
        Object.entries(c.ailments).sort((a, b) => b[1] - a[1])[0]?.[0] || "-",
    }))
    .sort((a, b) => b.visits - a.visits);
}

/** Week-over-week comparison from student records */
export function computeWeeklyComparison(records) {
  if (!records?.length) return null;

  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  const thisWeekRecords = records.filter(
    (r) => new Date(r.timestamp) >= thisWeekStart
  );
  const lastWeekRecords = records.filter((r) => {
    const d = new Date(r.timestamp);
    return d >= lastWeekStart && d < lastWeekEnd;
  });

  const thisWeekVisits = thisWeekRecords.length;
  const lastWeekVisits = lastWeekRecords.length;

  return {
    thisWeek: {
      visits: thisWeekVisits,
      uniqueStudents: new Set(thisWeekRecords.map((r) => r.admNo)).size,
    },
    lastWeek: {
      visits: lastWeekVisits,
      uniqueStudents: new Set(lastWeekRecords.map((r) => r.admNo)).size,
    },
    percentChange:
      lastWeekVisits > 0
        ? Math.round(
            ((thisWeekVisits - lastWeekVisits) / lastWeekVisits) * 100
          )
        : null,
  };
}

/** Month-over-month comparison using current + archived report data */
export function computeMonthComparison(currentReport, archivedReport) {
  if (!currentReport?.length || !archivedReport?.length) return null;

  const currentTotal = computeMonthTotal(currentReport);
  const archivedTotal = computeMonthTotal(archivedReport);

  const currentTop = computeTopAilment(currentReport);
  const archivedTop = computeTopAilment(archivedReport);

  return {
    currentMonth: { total: currentTotal, topAilment: currentTop },
    previousMonth: { total: archivedTotal, topAilment: archivedTop },
    percentChange:
      archivedTotal > 0
        ? Math.round(
            ((currentTotal - archivedTotal) / archivedTotal) * 100
          )
        : null,
  };
}

/** Compute stats from a student's visit history (for student lookup) */
export function computeStudentLookupStats(history) {
  if (!history?.length)
    return {
      totalVisits: 0,
      avgTemp: null,
      feverCount: 0,
      commonAilments: [],
    };

  const getTemp = (record) => {
    const temp = parseFloat(record.tempreading ?? record.tempReading);
    return isNaN(temp) ? null : temp;
  };

  const validTemps = history.map(getTemp).filter((t) => t !== null);
  const avgTemp =
    validTemps.length > 0
      ? (validTemps.reduce((sum, t) => sum + t, 0) / validTemps.length).toFixed(
          1
        )
      : null;

  const commonAilments = Object.entries(
    history.reduce((acc, r) => {
      if (r.ailment) acc[r.ailment] = (acc[r.ailment] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return {
    totalVisits: history.length,
    avgTemp,
    feverCount: validTemps.filter((t) => t > 37).length,
    commonAilments,
  };
}
