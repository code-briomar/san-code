import { base_api } from "@/lib/base_api";

/**
 * Verify monitor passcode against backend
 */
export const verifyMonitorPasscode = async (passcode) => {
  try {
    const response = await base_api.post("/monitor/verify", { passcode });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch real-time monitoring dashboard statistics
 */
export const fetchMonitorStats = async (passcode) => {
  try {
    const response = await base_api.get("/monitor/stats", {
      headers: {
        "x-monitor-passcode": passcode,
      },
      params: { passcode },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update monitor passcode
 */
export const updateMonitorPasscode = async (currentPasscode, newPasscode) => {
  try {
    const response = await base_api.post("/monitor/passcode", {
      currentPasscode,
      newPasscode,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Quick ping frontend domain
 */
export const pingFrontend = async () => {
  const start = performance.now();
  try {
    await fetch("/favicon.ico", { cache: "no-store", method: "HEAD" });
    const latency = Math.round(performance.now() - start);
    return { status: "online", latency };
  } catch (e) {
    return { status: "degraded", latency: Math.round(performance.now() - start) };
  }
};
