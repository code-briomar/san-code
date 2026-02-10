// Official MOH 705B Disease Mapping (Over 5 Years)
// Maps system disease names from ailments.js to official MOH 705 rows

export const MOH_705B_DISEASES = [
  { number: 1, officialName: "Diarrhoea", systemNames: ["Diarrhoea"] },
  { number: 2, officialName: "Tuberculosis", systemNames: ["Tuberculosis"] },
  { number: 3, officialName: "Dysentery (Bloody Diarrhoea)", systemNames: ["Dysentery ( Bloody Diarrhoea )"] },
  { number: 4, officialName: "Cholera", systemNames: ["Cholera"] },
  { number: 5, officialName: "Meningococcal Meningitis", systemNames: ["Meningococcal Meningitis"] },
  { number: 6, officialName: "Other Meningitis", systemNames: ["Other Meningitis"] },
  { number: 7, officialName: "Tetanus", systemNames: ["Tetanus"] },
  { number: 8, officialName: "Poliomyelitis (AFP)", systemNames: ["Poliomyelitis (AFP)"] },
  { number: 9, officialName: "Chicken Pox", systemNames: ["Chicken Pox"] },
  { number: 10, officialName: "Measles", systemNames: ["Measles"] },
  { number: 11, officialName: "Hepatitis", systemNames: ["Hepatitis"] },
  { number: 12, officialName: "Mumps", systemNames: ["Mumps"] },
  { number: 13, officialName: "Fevers", systemNames: ["Fevers"] },
  { number: 14, officialName: "Suspected Malaria", systemNames: ["Suspected Malaria"] },
  { number: 15, officialName: "Confirmed Malaria (Positive Cases)", systemNames: ["Confirmed Malaria ( Only Positive Cases )"] },
  { number: 16, officialName: "Malaria in Pregnancy", systemNames: ["Malaria in Pregnancy"] },
  { number: 17, officialName: "Typhoid Fever", systemNames: ["Typhoid Fever"] },
  { number: 18, officialName: "STI", systemNames: ["Sexually Transmitted Infections"] },
  { number: 19, officialName: "Urinary Tract Infections", systemNames: ["Urinary Tract Infections"] },
  { number: 20, officialName: "Bilharzia", systemNames: ["Bilharzia"] },
  { number: 21, officialName: "Intestinal Worms", systemNames: ["Intestinal Worms"] },
  { number: 22, officialName: "Malnutrition", systemNames: ["Malnutrition"] },
  { number: 23, officialName: "Anaemia", systemNames: ["Anaemia"] },
  { number: 24, officialName: "Eye Conditions", systemNames: ["Eye Infections", "Other Eye Conditions"] },
  { number: 25, officialName: "Ear Infections / Conditions", systemNames: ["Ear Infections"] },
  { number: 26, officialName: "Upper Respiratory Tract Infections", systemNames: ["Upper Respiratory Tract Infections"] },
  { number: 27, officialName: "Asthma", systemNames: ["Asthma"] },
  { number: 28, officialName: "Pneumonia", systemNames: ["Pneumonia"] },
  { number: 29, officialName: "Other Dis. of Respiratory System", systemNames: ["Other Dis. of Respiratory System"] },
  { number: 30, officialName: "Abortion", systemNames: ["Arbotion"] },
  { number: 31, officialName: "Dis. of Puerperium & Child Birth", systemNames: ["Dis. of Puerperium and Child Birth"] },
  { number: 32, officialName: "Hypertension", systemNames: ["Hypertension"] },
  { number: 33, officialName: "Mental Disorders", systemNames: ["Mental Disorders"] },
  { number: 34, officialName: "Dental Disorders", systemNames: ["Dental Disorders"] },
  { number: 35, officialName: "Diseases of the Skin", systemNames: ["Diseases of the Skin", "Jiggers Infestation"] },
  { number: 36, officialName: "Arthritis, Joint Pains etc.", systemNames: ["Arthritis, Joint Pains, etc.", "Muscular Skeletal Conditions"] },
  { number: 37, officialName: "Poisoning", systemNames: ["Poisoning"] },
  { number: 38, officialName: "Road Traffic Injuries", systemNames: ["Road Traffic Injuries"] },
  { number: 39, officialName: "Other Injuries", systemNames: ["Other Injuries", "Fractures", "Violence Related Injuries"] },
  { number: 40, officialName: "Sexual Assault", systemNames: ["Sexual Assault"] },
  { number: 41, officialName: "Burns", systemNames: ["Burns"] },
  { number: 42, officialName: "Bites (Snake/Dog/Other)", systemNames: ["Snake Bites", "Dog Bites", "Other Bites"] },
  { number: 43, officialName: "Diabetes", systemNames: ["Diabetes"] },
  { number: 44, officialName: "Epilepsy", systemNames: ["Epilepsy"] },
  { number: 45, officialName: "Newly Diagnosed HIV", systemNames: ["Newly Diagnosed HIV"] },
  { number: 46, officialName: "Brucellosis", systemNames: ["Brucellosis"] },
  { number: 47, officialName: "Cardiovascular Conditions", systemNames: ["Cardiovascular conditions"] },
  { number: 48, officialName: "Central Nervous System Conditions", systemNames: ["Central Nervous System Conditions"] },
  { number: 49, officialName: "Overweight (BMI>25)", systemNames: ["Overweight ( BMI > 25 )"] },
  { number: 50, officialName: "ALL OTHER DISEASES", systemNames: ["Fistula ( Birth Related )", "Neoplasms", "Physical Disability", "Tryponosomiasis", "Kalazar ( Leishmaniasis )", "Dracunculosis ( Guinea Worm )", "Yellow Fever", "Viral Haemorrhagic Fever", "Plague", "Death due to road traffic injuries", "ALL OTHER DISEASES"] },
];

// Summary rows calculated client-side
export const MOH_705B_SUMMARY_ROWS = [
  { number: "T", officialName: "TOTAL NEW CASES", type: "total_new_cases" },
  { number: "FA", officialName: "NO. OF FIRST ATTENDANCES", type: "first_attendances" },
  { number: "RA", officialName: "RE-ATTENDANCES", type: "re_attendances" },
  { number: "RI", officialName: "REFERRALS FROM (Other Health Facility / Community Unit)", type: "referrals_in" },
  { number: "RO", officialName: "REFERRALS TO (Other Health Facility / Community Unit)", type: "referrals_out" },
];

/**
 * Aggregate raw report data (from API) into MOH 705 format.
 * @param {Array} reportData - array of { disease, 1, 2, ..., 31 }
 * @returns {{ diseaseRows: Array, summaryRows: Array }}
 */
export function aggregateForMOH705(reportData) {
  const lookup = reportData.reduce((acc, entry) => {
    acc[entry.disease] = entry;
    return acc;
  }, {});

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const diseaseRows = MOH_705B_DISEASES.map((row) => {
    const dayValues = {};
    let total = 0;

    days.forEach((day) => {
      let value = 0;
      row.systemNames.forEach((sysName) => {
        value += Number(lookup[sysName]?.[day]) || 0;
      });
      dayValues[day] = value;
      total += value;
    });

    return {
      number: row.number,
      name: row.officialName,
      days: dayValues,
      total,
    };
  });

  // Total new cases: sum of all disease rows (1-50) per day
  const totalNewCases = { days: {}, total: 0 };
  days.forEach((day) => {
    let sum = 0;
    diseaseRows.forEach((r) => {
      if (r.number >= 1 && r.number <= 50) sum += r.days[day];
    });
    totalNewCases.days[day] = sum;
    totalNewCases.total += sum;
  });

  // First attendances
  const firstAttendances = { days: {}, total: 0 };
  days.forEach((day) => {
    const val = Number(lookup["NO. OF FIRST ATTENDANCES"]?.[day]) || 0;
    firstAttendances.days[day] = val;
    firstAttendances.total += val;
  });

  // Re-attendances
  const reAttendances = { days: {}, total: 0 };
  days.forEach((day) => {
    const val = Number(lookup["RE-ATTENDANCES"]?.[day]) || 0;
    reAttendances.days[day] = val;
    reAttendances.total += val;
  });

  // Referrals in
  const referralsIn = { days: {}, total: 0 };
  days.forEach((day) => {
    const val =
      (Number(lookup["Referrals from other health facility"]?.[day]) || 0) +
      (Number(lookup["Referrals from community unit"]?.[day]) || 0);
    referralsIn.days[day] = val;
    referralsIn.total += val;
  });

  // Referrals out
  const referralsOut = { days: {}, total: 0 };
  days.forEach((day) => {
    const val =
      (Number(lookup["Referrals to other health facility"]?.[day]) || 0) +
      (Number(lookup["Referrals to community unit"]?.[day]) || 0);
    referralsOut.days[day] = val;
    referralsOut.total += val;
  });

  const summaryRows = [
    { label: "TOTAL NEW CASES", ...totalNewCases },
    { label: "NO. OF FIRST ATTENDANCES", ...firstAttendances },
    { label: "RE-ATTENDANCES", ...reAttendances },
    { label: "REFERRALS IN", ...referralsIn },
    { label: "REFERRALS OUT", ...referralsOut },
  ];

  return { diseaseRows, summaryRows };
}
