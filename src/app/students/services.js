// Function : Fetch student data with the provided admission number
import { updateReport } from "@/app/services";
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

// Route : /students-going-to-hospital
export const fetchStudentsGoingToHospital = async () => {
  try {
    const response = await base_api.get("/students-going-to-hospital");
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return null;
  }
};
export const updateStudentDetails = async (
  studentAdmNo,
  tempReading,
  complain,
  ailment,
  going_to_hospital
) => {
  try {
    const response = base_api.post("/student-quick-update", {
      studentAdmNo,
      tempReading,
      complain,
      ailment,
      going_to_hospital,
    });

    const updateReportResponse = await updateReport();
    if (updateReportResponse.data.status === 200) {
      devMode && console.log("Update report sent successfully");
      return response;
    } else {
      throw new Error("Update report failed");
    }
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
