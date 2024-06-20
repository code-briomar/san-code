// Function : Fetch student data with the provided admission number

const { base_api } = require("@/lib/base_api");
const { devMode } = require("@/lib/dev_mode");

// Route : /students/:admissionNumber
export const fetchStudentData = async (admissionNumber) => {
  try {
    const response = await base_api.get(`/students/${admissionNumber}`);
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return null;
  }
};
