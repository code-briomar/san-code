// Function : Update staff details
// Route : /staff-quick-update

import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const updateStaffData = async (
  idNo,
  tempReading,
  complain,
  medication
) => {
  try {
    const response = base_api.post("/staff-quick-update", {
      idNo,
      tempReading,
      complain,
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
      console.log(error);
    }
    return null;
  }
};
