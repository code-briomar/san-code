import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeSwitcher from "@/components/custom/ThemeSwitcher";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "sanCode",
  description: "Manage student health records",
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en">
        <body className={inter.className}>
          <Toaster richColors />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <ThemeSwitcher />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
