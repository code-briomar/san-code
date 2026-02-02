import { updateReport } from "@/app/services";
import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

// Create a record for a non-Busherian (visiting) student
export const createNonBusherianRecord = async ({
  studentName,
  schoolName,
  tempReading,
  complain,
  ailment,
  medication,
  going_to_hospital,
}) => {
  try {
    const response = await base_api.post("/non-busherian-entry", {
      studentName,
      schoolName,
      tempReading,
      complain,
      ailment,
      medication,
      going_to_hospital,
    });

    // Try to update report, but don't fail if it doesn't work
    try {
      const updateReportResponse = await updateReport();
      if (devMode) console.log(updateReportResponse);
      if (updateReportResponse?.data?.status === 200) {
        devMode && console.log("Update report sent successfully");
      }
    } catch (reportError) {
      // Report update failed, but record was created - continue
      if (devMode) console.error("Report update failed:", reportError);
    }

    return response;
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return null;
  }
};

// Fetch non-Busherian records (filter by class starting with [NB])
export const fetchNonBusherianRecords = async () => {
  try {
    const response = await base_api.get("/student-data");
    const allRecords = response.data || [];

    // Filter for non-Busherian records (class starts with [NB])
    const nonBusherianRecords = allRecords.filter(
      (record) => record.class && record.class.startsWith("[NB]")
    );

    // Sort by timestamp descending (most recent first)
    return nonBusherianRecords.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (error) {
    if (devMode) {
      console.error(error);
    }
    return [];
  }
};
