import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Function : Fetch report data
export const fetchReportData = () => {
  try {
    const response = base_api.get("/report");
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Download report as Excel
export const downloadReportExcel = () => {
  const baseURL = base_api.defaults.baseURL;
  window.open(baseURL + "/export-report-excel", "_blank");
};

// Function : Fetch list of archived months
export const fetchArchivedMonths = async () => {
  try {
    const response = await base_api.get("/archived-months");
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Fetch archived report for a specific month
export const fetchArchivedReport = async (month) => {
  try {
    const response = await base_api.get(`/archived-report/${month}`);
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Trigger backfill for a specific month
export const triggerBackfill = async (month) => {
  try {
    const response = await base_api.post(`/backfill-archive/${month}`);
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};
