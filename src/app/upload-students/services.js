import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Function : Upload Students Excel Data
export const uploadStudentsExcelData = async (excelInfo) => {
  try {
    const response = await base_api.post("/new-students", excelInfo);

    return response;
  } catch (error) {
    if (devMode) console.error("An error occurred while fetching data:", error);
    return null;
  }
};
