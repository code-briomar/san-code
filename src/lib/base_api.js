import axios from "axios";
import { devMode } from "./dev_mode";

export const base_api = axios.create({
  // baseURL: devMode
    // baseURL: "http://localhost:5000",
  //   : "https://sancode-api.onrender.com", // -> OLD LIVE SERVER LINK
  // "https://san-code-api.lomogan.africa",
  baseURL: "https://lomogan.africa/sanCode-API/"|| "https://sancode-api.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});
