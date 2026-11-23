import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Fetch student clinic status for teacher verification
export const verifyStudentClinicStatus = async (admNo, passcode) => {
  try {
    const response = await base_api.get(`/teachers/verify/${admNo}`, {
      params: { passcode }
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("verifyStudentClinicStatus error:", error);
    }
    throw error;
  }
};

// Fetch all class teachers with metrics
export const fetchClassTeachers = async () => {
  try {
    const response = await base_api.get("/class-teachers");
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("fetchClassTeachers error:", error);
    }
    throw error;
  }
};

// Fetch detailed class roster, health status, and clinic visits
export const fetchClassDetails = async (className, passcode) => {
  try {
    const response = await base_api.get(`/class-teachers/${encodeURIComponent(className)}`, {
      params: { passcode }
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("fetchClassDetails error:", error);
    }
    throw error;
  }
};

// Fetch classroom attendance register for a specific date and session
export const fetchClassAttendance = async (className, date, session, passcode) => {
  try {
    const response = await base_api.get(`/class-attendance/${encodeURIComponent(className)}`, {
      params: { date, session, passcode }
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("fetchClassAttendance error:", error);
    }
    throw error;
  }
};

// Save / submit classroom attendance register
export const saveClassAttendance = async (className, payload, passcode) => {
  try {
    const response = await base_api.post(`/class-attendance/${encodeURIComponent(className)}`, payload, {
      params: { passcode }
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("saveClassAttendance error:", error);
    }
    throw error;
  }
};

// Fetch attendance history for the class
export const fetchClassAttendanceHistory = async (className, month, passcode) => {
  try {
    const response = await base_api.get(`/class-attendance/${encodeURIComponent(className)}/history`, {
      params: { month, passcode }
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("fetchClassAttendanceHistory error:", error);
    }
    throw error;
  }
};


