// Function : Update staff details
// Route : /staff-quick-update

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const updateStaffData = (idNo, tempReading) => {
  try {
    const response = base_api.post("/staff-quick-update", {
      idNo,
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
