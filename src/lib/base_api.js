import axios from "axios";
import { devMode } from "./dev_mode";

export const base_api = axios.create({
  baseURL: devMode
    ? "http://localhost:5000"
    : "https://sancode-api.onrender.com", // -> OLD LIVE SERVER LINK
  // "https://san-code-api.lomogan.africa",
  headers: {
    "Content-Type": "application/json",
  },
});
