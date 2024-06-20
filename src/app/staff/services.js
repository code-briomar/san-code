const { base_api } = require("@/lib/base_api");
const { devMode } = require("@/lib/dev_mode");

// Function : Create a new record for staff
export const createNewStaffRecord = async (idNo, fName, sName) => {
  try {
    const response = await base_api.post(`/staff-create-entry`, {
      idNo: idNo,
      fName: fName,
      sName: sName,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return null;
  }
};

// Function : Fetch record for staff member
export const fetchStaffMemberData = async (idNo) => {
  try {
    const response = await base_api.get(`/staff/${idNo}`);
    return response;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};
