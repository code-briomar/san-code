// Function : Update staff details
// Route : /staff-quick-update

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const updateStaffData = async (
  idNo,
  tempReading,
  complain,
  medication
) => {
  try {
    const response = await base_api.post("/staff-quick-update", {
      idNo,
      tempReading,
      complain,
      medication,
    });
    return response;
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
