"use client";
import { ArrowRight, Users, UserCog, FileText, BarChart3, Upload, GraduationCap, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
          <Link
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
          </Link>

          {/* Secondary Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Staff */}
            <Link
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
            </Link>

            {/* Reports */}
            <Link
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
            </Link>

            {/* Analytics */}
            <Link
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
            </Link>

            {/* Upload */}
            <Link
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
            </Link>
          </div>

          {/* Portal Access */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3 text-center">
              External Portals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Teacher Verification */}
              <Link
                href="/teachers"
                className="p-4 rounded-lg border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/10 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition-colors group flex items-center gap-3"
              >
                <GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Teacher Portal</h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">Verify visits (Passcode)</p>
                </div>
              </Link>

              {/* Parent Access */}
              <Link
                href="/parents"
                className="p-4 rounded-lg border-2 border-green-100 dark:border-green-900/50 bg-green-50/10 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-800 transition-colors group flex items-center gap-3"
              >
                <Heart className="w-5 h-5 text-green-500 dark:text-green-400" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Parent Portal</h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">M-Pesa clinical lookup</p>
                </div>
              </Link>
            </div>
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
