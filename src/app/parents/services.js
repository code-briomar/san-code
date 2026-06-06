import { base_api } from "@/lib/base_api";
import { devMode } from "@/lib/dev_mode";

export const requestOTP = async (admNo, parentContact) => {
  try {
    const response = await base_api.post("/parents/request-otp", {
      admNo: Number(admNo),
      parentContact,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("requestOTP error:", error);
    }
    throw error;
  }
};

export const verifyOTP = async (admNo, parentContact, otp) => {
  try {
    const response = await base_api.post("/parents/verify-otp", {
      admNo: Number(admNo),
      parentContact,
      otp,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("verifyOTP error:", error);
    }
    throw error;
  }
};

export const fetchChildHistory = async (token) => {
  try {
    const response = await base_api.get("/parents/records", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("fetchChildHistory error:", error);
    }
    throw error;
  }
};

export const initiateMpesaStkPush = async (admNo, phoneNumber) => {
  try {
    const response = await base_api.post("/parents/mpesa-stkpush", {
      admNo: Number(admNo),
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("initiateMpesaStkPush error:", error);
    }
    throw error;
  }
};

export const verifyMpesaPayment = async (checkoutRequestId, mpesaCode) => {
  try {
    const response = await base_api.post("/parents/mpesa-verify", {
      checkoutRequestId,
      mpesaCode: mpesaCode || undefined,
    });
    return response.data;
  } catch (error) {
    if (devMode) {
      console.error("verifyMpesaPayment error:", error);
    }
    throw error;
  }
};
