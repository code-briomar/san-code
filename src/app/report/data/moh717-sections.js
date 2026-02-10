// MOH 717 Monthly Workload Report section definitions

export const MOH_717_SECTIONS = [
  {
    id: "A",
    title: "OUTPATIENT SERVICES",
    autoPopulated: true,
    fields: [
      { key: "total_outpatients", label: "Total Outpatient Visits" },
      { key: "first_attendances", label: "No. of First Attendances" },
      { key: "re_attendances", label: "Re-Attendances" },
      { key: "referrals_from_facility", label: "Referrals from Other Health Facility" },
      { key: "referrals_to_facility", label: "Referrals to Other Health Facility" },
      { key: "referrals_from_community", label: "Referrals from Community Unit" },
      { key: "referrals_to_community", label: "Referrals to Community Unit" },
    ],
  },
  {
    id: "B",
    title: "INPATIENT SERVICES",
    autoPopulated: false,
    fields: [
      { key: "total_admissions", label: "Total Admissions" },
      { key: "total_discharges", label: "Total Discharges" },
      { key: "inpatient_days", label: "Total Inpatient Days (Bed Days)" },
      { key: "deaths_in_ward", label: "Deaths in Ward" },
      { key: "bed_occupancy", label: "Bed Occupancy Rate (%)" },
    ],
  },
  {
    id: "C",
    title: "MATERNITY SERVICES",
    autoPopulated: false,
    fields: [
      { key: "anc_visits", label: "ANC Visits" },
      { key: "deliveries_normal", label: "Normal Deliveries" },
      { key: "deliveries_cs", label: "Caesarean Sections" },
      { key: "deliveries_breech", label: "Breech Deliveries" },
      { key: "bba", label: "Born Before Arrival (BBA)" },
      { key: "live_births", label: "Live Births" },
      { key: "still_births", label: "Still Births" },
      { key: "maternal_deaths", label: "Maternal Deaths" },
    ],
  },
  {
    id: "D",
    title: "OPERATIONS / THEATRE",
    autoPopulated: false,
    fields: [
      { key: "major_operations", label: "Major Operations" },
      { key: "minor_operations", label: "Minor Operations" },
    ],
  },
  {
    id: "E",
    title: "LABORATORY",
    autoPopulated: false,
    fields: [
      { key: "lab_tests_total", label: "Total Lab Tests Done" },
      { key: "blood_units_issued", label: "Blood Units Issued" },
    ],
  },
  {
    id: "F",
    title: "RADIOLOGY / IMAGING",
    autoPopulated: false,
    fields: [
      { key: "xrays_done", label: "X-Rays Done" },
      { key: "ultrasounds_done", label: "Ultrasounds Done" },
    ],
  },
  {
    id: "G",
    title: "PHARMACY",
    autoPopulated: false,
    fields: [
      { key: "prescriptions_dispensed", label: "Prescriptions Dispensed" },
    ],
  },
  {
    id: "H",
    title: "MEDICAL RECORDS / HEALTH INFORMATION",
    autoPopulated: false,
    fields: [
      { key: "new_registrations", label: "New Patient Registrations" },
      { key: "records_retrieved", label: "Records Retrieved" },
    ],
  },
  {
    id: "I",
    title: "DENTAL SERVICES",
    autoPopulated: false,
    fields: [
      { key: "dental_visits", label: "Total Dental Visits" },
      { key: "extractions", label: "Extractions" },
      { key: "fillings", label: "Fillings" },
    ],
  },
  {
    id: "J",
    title: "MORTUARY SERVICES",
    autoPopulated: false,
    fields: [
      { key: "bodies_received", label: "Bodies Received" },
      { key: "post_mortems", label: "Post Mortems Done" },
      { key: "bodies_released", label: "Bodies Released" },
    ],
  },
];

/**
 * Populate Section A from report data
 * @param {Array} reportData - raw report data from API
 * @returns {Object} key-value for section A fields
 */
export function populateSectionA(reportData) {
  const lookup = reportData.reduce((acc, entry) => {
    acc[entry.disease] = entry;
    return acc;
  }, {});

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const sumDays = (diseaseName) => {
    const entry = lookup[diseaseName];
    if (!entry) return 0;
    return days.reduce((sum, day) => sum + (Number(entry[day]) || 0), 0);
  };

  const firstAttendances = sumDays("NO. OF FIRST ATTENDANCES");
  const reAttendances = sumDays("RE-ATTENDANCES");

  return {
    total_outpatients: firstAttendances + reAttendances,
    first_attendances: firstAttendances,
    re_attendances: reAttendances,
    referrals_from_facility: sumDays("Referrals from other health facility"),
    referrals_to_facility: sumDays("Referrals to other health facility"),
    referrals_from_community: sumDays("Referrals from community unit"),
    referrals_to_community: sumDays("Referrals to community unit"),
  };
}
