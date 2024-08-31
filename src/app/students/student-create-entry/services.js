import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const createEntry = async ({
  admNo,
  fName,
  sName,
  class: studentClass
}) => {
  try {
    const response = base_api.post("/student-create-entry", {
      admNo,
      fName,
      sName,
      class:studentClass
    });

    return response
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
