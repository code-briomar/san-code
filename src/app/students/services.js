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

export const fetchStudentHistory = async (admissionNumber) => {
  try {
    const response = await base_api.get(`/students/history/${admissionNumber}`);
    return response.data;
  } catch (error) {
    devMode && console.error(error);
  }
}

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
// Route: PATCH /student-profile/:admNo
export const updateStudentProfile = async (admNo, profileData) => {
  try {
    const response = await base_api.patch(`/student-profile/${admNo}`, profileData);
    return response.data;
  } catch (error) {
    devMode && console.error(error);
    return null;
  }
};

// Fetch unique student classes from dedicated /classes endpoint
export const fetchAllStudentClasses = async () => {
  try {
    const response = await base_api.get("/classes");
    return response.data || [];
  } catch (error) {
    devMode && console.error(error);
    return [];
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
    const response = await base_api.post("/student-quick-update", {
      studentAdmNo,
      tempReading,
      complain,
      ailment,
      going_to_hospital,
    });
    return response;
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};

export const createStudentFollowUp = async (admNo, scheduledTime, reason) => {
  try {
    const response = await base_api.post("/nurse/followup", {
      admNo: Number(admNo),
      scheduledTime,
      reason,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("createStudentFollowUp error:", error);
    }
    return null;
  }
};
