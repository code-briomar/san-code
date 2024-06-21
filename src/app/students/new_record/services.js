// Function : Submit new record of student
// Route : /student-full-entry
// studentAdmNo : testAdmissionNumber,
// tempReading : 45.8,
// complain: "Fever",
// ailment: "Fevers",

import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// medication: "gfddddddde"
export const createNewStudentRecord = async ({
  studentAdmNo,
  tempReading,
  complain,
  ailment,
  medication,
}) => {
  try {
    const response = base_api.post("/student-full-entry", {
      studentAdmNo,
      tempReading,
      complain,
      ailment,
      medication,
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
      console.log();
    }
    return null;
  }
};
