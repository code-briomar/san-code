import axios from "axios";
import { devMode } from "./dev_mode";

export const base_api = axios.create({
  baseURL: devMode ? "http://localhost:8082" : "https://sancode-api.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});
