// Function : Fetch student data with the provided admission number
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Route : /students/:admissionNumber
export const fetchStudentData = async (admissionNumber) => {
  try {
    const response = await base_api.get(`/students/${admissionNumber}`);

    return response.data;
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return null;
  }
};
