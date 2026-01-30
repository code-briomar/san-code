"use client";
import { ArrowRight, Users, UserCog, FileText, BarChart3, Upload } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          SanCode
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          School Health Management
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-4">
          {/* Primary Card - Students */}
          <a
            href="/students"
            className="block p-6 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Students
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage student health records
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
            </div>
          </a>

          {/* Secondary Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Staff */}
            <a
              href="/staff"
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <UserCog className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Staff</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Health records</p>
                </div>
              </div>
            </a>

            {/* Reports */}
            <a
              href="/report"
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Reports</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View & export</p>
                </div>
              </div>
            </a>

            {/* Analytics */}
            <a
              href="/analytics"
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Insights & trends</p>
                </div>
              </div>
            </a>

            {/* Upload */}
            <a
              href="/upload-students"
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Upload</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Import data</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 dark:border-zinc-800">
        <a
          href="https://lomogantech.co.ke"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span>By</span>
          <Image
            src="/lomogan-logo.ico"
            alt="LomoganTech Logo"
            className="rounded"
            width={20}
            height={20}
          />
          <span>LomoganTech</span>
        </a>
      </footer>
    </div>
  );
}
