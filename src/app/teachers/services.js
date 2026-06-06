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
