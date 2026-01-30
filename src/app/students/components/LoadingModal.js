"use client";
import { LucideLoader } from "lucide-react";

export default function LoadingModal({ open, message = "Loading..." }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
        <LucideLoader className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
