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
