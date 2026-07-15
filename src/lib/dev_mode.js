// Set the dev mode dynamically based on environment / hostname
export const devMode = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  : (process.env.NODE_ENV === "development");
