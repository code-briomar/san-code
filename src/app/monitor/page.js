"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  Lock,
  KeyRound,
  ShieldAlert,
  Loader2,
  Clock,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import PasswordGate from "./components/PasswordGate";
import NurseActivityCard from "./components/NurseActivityCard";
import SystemHealthCard from "./components/SystemHealthCard";
import MetricsCards from "./components/MetricsCards";
import HourlyActivityChart from "./components/HourlyActivityChart";
import LiveVisitsFeed from "./components/LiveVisitsFeed";
import MedicationLogsTable from "./components/MedicationLogsTable";
import PasscodeSettingsModal from "./components/PasscodeSettingsModal";

import { verifyMonitorPasscode, fetchMonitorStats, pingFrontend } from "./services";

const SESSION_UNLOCKED_KEY = "sancode_monitor_unlocked";
const SESSION_PASSCODE_KEY = "sancode_monitor_passcode";

export default function MonitorPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [frontendStatus, setFrontendStatus] = useState(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // in seconds, 0 = off
  const [countdown, setCountdown] = useState(30);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  // Load session auth on mount
  useEffect(() => {
    const savedUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY);
    const savedPasscode = sessionStorage.getItem(SESSION_PASSCODE_KEY);

    if (savedUnlocked === "true" && savedPasscode) {
      setPasscode(savedPasscode);
      setIsUnlocked(true);
      loadDashboard(savedPasscode);
    } else {
      setInitialLoading(false);
    }
  }, []);

  // Fetch dashboard data
  const loadDashboard = useCallback(async (activePasscode, showToast = false) => {
    const code = activePasscode || passcode;
    if (!code) return;

    setRefreshing(true);
    setStatsError("");

    try {
      const [statsData, pingData] = await Promise.all([
        fetchMonitorStats(code),
        pingFrontend(),
      ]);

      setStats(statsData);
      setFrontendStatus(pingData);
      setLastUpdated(new Date());
      setCountdown(autoRefreshInterval || 30);

      if (showToast) {
        toast.success("Monitoring metrics refreshed");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 401) {
        handleSignOut();
        setAuthError("Session expired or invalid passcode. Please log in again.");
      } else {
        setStatsError(err.response?.data?.error || err.message || "Failed to load monitor stats");
        if (showToast) {
          toast.error("Failed to refresh monitor stats");
        }
      }
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [passcode, autoRefreshInterval]);

  // Handle Unlock from Password Gate
  const handleUnlock = async (enteredPasscode) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      await verifyMonitorPasscode(enteredPasscode);

      // Save session
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true");
      sessionStorage.setItem(SESSION_PASSCODE_KEY, enteredPasscode);
      setPasscode(enteredPasscode);
      setIsUnlocked(true);

      // Load data
      await loadDashboard(enteredPasscode);
      toast.success("Welcome to System & Clinic Monitor");
    } catch (err) {
      const msg = err.response?.data?.error || "Incorrect passcode. Access denied.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out / Lock
  const handleSignOut = () => {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    sessionStorage.removeItem(SESSION_PASSCODE_KEY);
    setIsUnlocked(false);
    setPasscode("");
    setStats(null);
    setStatsError("");
  };

  // Auto-refresh timer loop
  useEffect(() => {
    if (!isUnlocked || autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadDashboard(passcode);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnlocked, autoRefreshInterval, passcode, loadDashboard]);

  // Handle Passcode Update from modal
  const handlePasscodeUpdated = (newCode) => {
    setPasscode(newCode);
    sessionStorage.setItem(SESSION_PASSCODE_KEY, newCode);
  };

  // If locked, display password screen
  if (!isUnlocked) {
    if (initialLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      );
    }
    return (
      <PasswordGate
        onUnlock={handleUnlock}
        loading={authLoading}
        errorMsg={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight flex items-center gap-2">
                  sanCode Monitor
                  <Badge variant="outline" className="font-mono text-[10px] text-emerald-600 border-emerald-500/30">
                    LIVE
                  </Badge>
                </h1>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Dispensary Usage & System Infrastructure Telemetry
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Auto-refresh selector */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Refresh:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAutoRefreshInterval(val);
                  setCountdown(val);
                }}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={0}>Paused</option>
              </select>
              {autoRefreshInterval > 0 && (
                <span className="font-mono text-[10px] text-zinc-400">({countdown}s)</span>
              )}
            </div>

            {/* Manual Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboard(passcode, true)}
              disabled={refreshing}
              className="h-8 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Sync Now
            </Button>

            {/* Change Passcode */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPasscodeModalOpen(true)}
              className="h-8 gap-1.5 text-xs border-zinc-200 dark:border-zinc-800"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Passcode
            </Button>

            {/* Lock / Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {statsError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{statsError}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadDashboard(passcode, true)}
              className="h-7 text-xs border-red-500/30 text-red-600 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}

        {/* 1. Nurse Activity & Clinic Usage Card */}
        <NurseActivityCard
          nurseData={stats?.nurse}
          serverTime={stats?.generatedAt}
        />

        {/* 2. Lifetime Database Metrics */}
        <MetricsCards counts={stats?.counts} />

        {/* 3. System Infrastructure & Health */}
        <SystemHealthCard
          systemHealth={stats?.systemHealth}
          queryTimeMs={stats?.queryTimeMs}
          frontendStatus={frontendStatus}
        />

        {/* 4. Today's Hourly Consultation Curve */}
        <HourlyActivityChart hourlyData={stats?.hourlyActivity} />

        {/* 5. Live Patient Stream */}
        <LiveVisitsFeed
          studentVisits={stats?.recentVisits?.students}
          staffVisits={stats?.recentVisits?.staff}
        />

        {/* 6. Recent Medication Dispensations */}
        <MedicationLogsTable medications={stats?.recentMedications} />
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        sanCode Clinic Monitor • Protected by LomoganTech Security • Last synced:{" "}
        {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
      </footer>

      {/* Passcode Modal */}
      <PasscodeSettingsModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        currentPasscode={passcode}
        onPasscodeUpdated={handlePasscodeUpdated}
      />
    </div>
  );
}
