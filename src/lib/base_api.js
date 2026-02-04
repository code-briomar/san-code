import axios from "axios";
import { devMode } from "./dev_mode";

export const base_api = axios.create({
  // baseURL: devMode
  //   ? "http://localhost:5000"
  //   : "https://sancode-api.onrender.com", // -> OLD LIVE SERVER LINK
  // "https://san-code-api.lomogan.africa",
  baseURL: "https://156.232.88.204/sanCode-API/",
  headers: {
    "Content-Type": "application/json",
  },
});
