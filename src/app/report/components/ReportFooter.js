"use client";

const ReportFooter = () => {
  return (
    <div className="report-footer mt-4 print:mt-1 text-xs">
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Completed By (Name):</span>
          <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-40 print-underline">&nbsp;</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Designation:</span>
          <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-32 print-underline">&nbsp;</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Sign:</span>
          <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-28 print-underline">&nbsp;</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold whitespace-nowrap dark:text-gray-200">Date:</span>
          <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-24 print-underline">&nbsp;</span>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <span className="font-bold text-sm dark:text-gray-100">MOH 705B</span>
      </div>
    </div>
  );
};

export default ReportFooter;
