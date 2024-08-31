// Function : Update student details
// Route : /student-quick-update
// studentAdmNo : testAdmissionNumber,
// tempReading : 45.8,

import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const updateEntry = async ({admNo, fName, sName, studentClass}) => {
  try {
    const response = base_api.post("/student-update-entry", {
      admNo,
      fName,
      sName,
      class: studentClass,
    });

    return response;
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
