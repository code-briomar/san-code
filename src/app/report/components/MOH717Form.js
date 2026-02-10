"use client";

import { useState } from "react";
import { MOH_717_SECTIONS, populateSectionA } from "../data/moh717-sections";

const MOH717Form = ({ reportData, facilityName, district, month, year }) => {
  const autoValues = populateSectionA(reportData);
  const [formValues, setFormValues] = useState({});

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="moh717-print-area">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-sm font-bold uppercase dark:text-gray-100">Republic of Kenya</p>
        <p className="text-sm font-bold uppercase dark:text-gray-100">Ministry of Health</p>
        <p className="text-xs font-semibold mt-1 dark:text-gray-300">
          MONTHLY WORKLOAD REPORT FOR HEALTH FACILITIES (MOH 717)
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-4">
        <div className="flex items-center gap-1">
          <span className="font-semibold dark:text-gray-200">Facility:</span>
          <span className="border-b border-gray-400 dark:border-gray-500 inline-block min-w-[120px] px-1 dark:text-gray-300">
            {facilityName || "\u00A0"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold dark:text-gray-200">District/Sub-County:</span>
          <span className="border-b border-gray-400 dark:border-gray-500 inline-block min-w-[120px] px-1 dark:text-gray-300">
            {district || "\u00A0"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold dark:text-gray-200">Month:</span>
          <span className="border-b border-gray-400 dark:border-gray-500 inline-block min-w-[80px] px-1 dark:text-gray-300">
            {month || "\u00A0"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold dark:text-gray-200">Year:</span>
          <span className="border-b border-gray-400 dark:border-gray-500 inline-block min-w-[60px] px-1 dark:text-gray-300">
            {year || "\u00A0"}
          </span>
        </div>
      </div>

      {/* Sections */}
      {MOH_717_SECTIONS.map((section) => (
        <div key={section.id} className="mb-4">
          <h4 className="text-xs font-bold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2 dark:text-gray-100">
            Section {section.id}: {section.title}
            {section.autoPopulated && (
              <span className="font-normal text-gray-500 dark:text-gray-400 ml-2">(Auto-populated from report data)</span>
            )}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {section.fields.map((field) => {
              const isAuto = section.autoPopulated;
              const value = isAuto
                ? autoValues[field.key] ?? ""
                : formValues[field.key] ?? "";

              return (
                <div key={field.key} className="flex items-center gap-2 text-xs">
                  <span className="whitespace-nowrap min-w-[200px] dark:text-gray-300">{field.label}:</span>
                  {isAuto ? (
                    <span className="border-b border-gray-400 dark:border-gray-500 inline-block min-w-[80px] px-1 font-semibold text-center dark:text-gray-200">
                      {value || 0}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="border-b border-gray-400 dark:border-gray-500 bg-transparent outline-none w-20 text-xs text-center dark:text-gray-200 print-underline-input"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Signature block */}
      <div className="mt-6 text-xs">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold dark:text-gray-200">Completed By:</span>
            <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-40">&nbsp;</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold dark:text-gray-200">Designation:</span>
            <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-32">&nbsp;</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold dark:text-gray-200">Sign:</span>
            <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-28">&nbsp;</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold dark:text-gray-200">Date:</span>
            <span className="inline-block border-b border-gray-400 dark:border-gray-500 w-24">&nbsp;</span>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <span className="font-bold text-sm dark:text-gray-100">MOH 717</span>
        </div>
      </div>
    </div>
  );
};

export default MOH717Form;
