// Function : Submit new record of staff
// Route : /staff-full-entry
// idNo : testAdmissionNumber,
// tempReading : 45.8,
// complain: "Fever",
// ailment: "Fevers",

import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const createNewStaffRecord = ({
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
    return response;
  } catch (error) {
    if (devMode) {
      console.log();
    }
    return null;
  }
};
