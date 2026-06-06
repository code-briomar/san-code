// Function : Submit new record of student
// Route : /student-full-entry
// studentAdmNo : testAdmissionNumber,
// tempReading : 45.8,
// complain: "Fever",
// ailment: "Fevers",

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// medication: "gfddddddde"
export const createNewStudentRecord = async ({
  studentAdmNo,
  tempReading,
  complain,
  ailment,
  medication,
  going_to_hospital,
}) => {
  try {
    const response = await base_api.post("/student-full-entry", {
      studentAdmNo,
      tempReading,
      complain,
      ailment,
      medication,
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
