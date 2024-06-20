import React from "react";
import { ThemeProvider as NextJSThemeProvider } from "next-themes";
const ThemeProvider = ({ children }) => {
  return (
    <NextJSThemeProvider
      attribute="class"
      themes={["light", "dark"]}
      children={children}
    />
  );
};

export default ThemeProvider;
