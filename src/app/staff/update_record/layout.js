import { Inter } from "next/font/google";
import "../../globals.css";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "sanCode | Students - New Record",
  description: "Manage student health records",
};

export default function StudentsNewRecordLayout({ children }) {
  return (
    <Suspense>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </Suspense>
  );
}
