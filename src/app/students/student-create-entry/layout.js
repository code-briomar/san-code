import { Inter } from "next/font/google";
import "../../globals.css";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "sanCode | Students - Create Entry",
  description: "Manage student health records",
};

export default function StudentCreateEntryLayout({ children }) {
  return (
    <div className={inter.className}>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
