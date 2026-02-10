"use client";

const ReportHeader = ({ facilityName, setFacilityName, district, setDistrict, month, setMonth, year, setYear }) => {
  return (
    <div className="report-header mb-2 print:mb-0">
      <div className="text-center mb-1 print:mb-0">
        <p className="text-sm font-bold uppercase dark:text-gray-100">Republic of Kenya</p>
        <p className="text-sm font-bold uppercase dark:text-gray-100">Ministry of Health</p>
        <p className="text-xs mt-1 print:mt-0 dark:text-gray-300">
          OVER 5 YEARS - DAILY OUTPATIENT MORBIDITY SUMMARY SHEET
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-2 print:mt-0 print-header-fields">
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Facility Name:</span>
          <input
            type="text"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className="border-b border-gray-400 dark:border-gray-500 bg-transparent outline-none w-40 text-xs dark:text-gray-200 print-underline-input"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">District/Sub-County:</span>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border-b border-gray-400 dark:border-gray-500 bg-transparent outline-none w-36 text-xs dark:text-gray-200 print-underline-input"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Month:</span>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border-b border-gray-400 dark:border-gray-500 bg-transparent outline-none w-24 text-xs dark:text-gray-200 print-underline-input"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Year:</span>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border-b border-gray-400 dark:border-gray-500 bg-transparent outline-none w-16 text-xs dark:text-gray-200 print-underline-input"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
