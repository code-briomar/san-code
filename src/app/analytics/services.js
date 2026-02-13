import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Function : Fetch report data
export const fetchReportData = async () => {
  try {
    const response = await base_api.get("/report");
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Fetch raw student visit records (last ~80 days)
export const fetchStudentRecords = async () => {
  try {
    const response = await base_api.get("/student-data");
    return response.data || [];
  } catch (error) {
    if (devMode) console.error(error);
    return [];
  }
};

// Re-exports for analytics convenience
export {
  fetchStudentsGoingToHospital,
  fetchStudentData,
  fetchStudentHistory,
} from "@/app/students/services";
export {
  fetchArchivedMonths,
  fetchArchivedReport,
} from "@/app/report/services";
