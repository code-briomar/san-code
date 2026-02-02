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
    // Return the first staff member if found
    if (response?.data?.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    if (devMode) console.error(error);
    return null;
  }
};

// Function : Fetch history for staff member
export const fetchStaffHistory = async (idNo) => {
  try {
    const response = await base_api.get(`/staff/history/${idNo}`);
    return response.data;
  } catch (error) {
    if (devMode) console.error(error);
    return [];
  }
};

// Fetch recent activity stats for staff dashboard (since yesterday morning)
export const fetchStaffStats = async () => {
  try {
    const response = await base_api.get("/staff-data");
    const allRecords = response.data || [];

    // Get yesterday at 6am as the cutoff (covers overnight/shift changes)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(6, 0, 0, 0);

    // Get today at midnight for "today" vs "yesterday" distinction
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // Filter records since yesterday morning
    const recentRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= yesterday;
    });

    // Also get just today's records for "today" count
    const todayRecords = recentRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= todayMidnight;
    });

    // Get unique staff seen (recent period)
    const uniqueStaffRecent = [...new Map(recentRecords.map(r => [r.idNo, r])).values()];
    const uniqueStaffToday = [...new Map(todayRecords.map(r => [r.idNo, r])).values()];

    // Get recent patients (last 5, sorted by timestamp descending)
    const recentPatients = [...recentRecords]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // Count ailments for outbreak detection (use recent period)
    const ailmentCounts = {};
    recentRecords.forEach((record) => {
      const ailment = record.ailment?.toLowerCase() || "unknown";
      ailmentCounts[ailment] = (ailmentCounts[ailment] || 0) + 1;
    });

    // Detect potential outbreaks (3+ staff with same ailment)
    const outbreaks = Object.entries(ailmentCounts)
      .filter(([, count]) => count >= 3)
      .map(([ailment, count]) => ({ ailment, count }));

    return {
      staffCount: uniqueStaffRecent.length,
      staffCountToday: uniqueStaffToday.length,
      totalVisits: recentRecords.length,
      totalVisitsToday: todayRecords.length,
      recentPatients,
      outbreaks,
    };
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
