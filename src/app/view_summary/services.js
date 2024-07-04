// Function : Fetch data from students in the last 7 days
// Route : /student-data

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const fetchStudentData = async () => {
  try {
    const response = await base_api.get("/student-data");
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Fetch data from staff in the last 7 days
// Route : /staff-data

export const fetchStaffData = async () => {
  try {
    const response = await base_api.get("/staff-data");
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};
