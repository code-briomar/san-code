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

// Function : Create new entry for staff
export const createNewStaffEntry = async ({
  idNo,
  tempReading,
  complain,
  ailment,
  medication,
}) => {
  try {
    const response = await base_api.post(`/staff-full-entry`, {
      idNo: idNo,
      tempReading: tempReading,
      complain: complain,
      ailment: ailment,
      medication: medication,
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
