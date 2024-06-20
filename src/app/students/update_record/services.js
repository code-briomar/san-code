// Function : Update student details
// Route : /student-quick-update
// studentAdmNo : testAdmissionNumber,
// tempReading : 45.8,

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const updateStudentDetails = (studentAdmNo, tempReading) => {
  try {
    const response = base_api.post("/student-quick-update", {
      studentAdmNo,
      tempReading,
    });
    return response;
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
