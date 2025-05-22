import { ThemeSwitcher } from "@/components/custom/ThemeSwitcher";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ThemeSwitcher />
            <Toaster richColors />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
