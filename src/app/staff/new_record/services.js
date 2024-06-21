// Function : Submit new record of staff
// Route : /staff-full-entry
// idNo : testAdmissionNumber,
// tempReading : 45.8,
// complain: "Fever",
// ailment: "Fevers",

import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const createNewStaffRecord = async ({
  idNo,
  tempReading,
  complain,
  ailment,
  medication,
}) => {
  try {
    const response = base_api.post("/staff-full-entry", {
      idNo,
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
