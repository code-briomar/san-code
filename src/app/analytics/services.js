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
