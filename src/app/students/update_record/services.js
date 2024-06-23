// Function : Update student details
// Route : /student-quick-update
// studentAdmNo : testAdmissionNumber,
// tempReading : 45.8,

import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

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
