import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "sanCode | New Students",
  description: "Manage student health records",
};

export default function UploadStudentsLayout({ children }) {
  return (
    <>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster richColors />
        </body>
      </html>
    </>
  );
}
