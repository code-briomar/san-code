import { base_api } from "@/lib/base_api";

export const updateReport = () => {
  try {
    return base_api.get("/update-report");
  } catch (error) {
    if (devMode) {
      console.log(error);
    }
    return null;
  }
};
