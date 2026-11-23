"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Globe,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  Wifi,
  HardDrive
} from "lucide-react";

export default function SystemHealthCard({ systemHealth, queryTimeMs, frontendStatus }) {
  if (!systemHealth) return null;

  const { apiStatus, apiUptimeFormatted, nodeVersion, memoryUsageMB, database } = systemHealth;

  const getLatencyColor = (ms) => {
    if (!ms || ms < 500) return "text-emerald-600 dark:text-emerald-400";
    if (ms < 1500) return "text-amber-600 dark:text-amber-400";
    return "text-red-500";
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                Infrastructure & Health
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                End-to-end service status, round-trip latency & database connectivity
              </CardDescription>
            </div>
          </div>
          <Badge
            className={
              apiStatus === "healthy" && database?.status === "healthy"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"
            }
          >
            <CheckCircle2 className="w-3 h-3" />
            Operational
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Frontend (Vercel) */}
          <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                Frontend Web
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vercel CDN
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="block text-[10px] uppercase font-mono text-zinc-400">Host Domain</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate block">
                san-code.vercel.app
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Client Latency:</span>
              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                {frontendStatus?.latency ? `${frontendStatus.latency} ms` : "Instant (Edge)"}
              </span>
            </div>
          </div>

          {/* Backend API (Render) */}
          <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Backend API
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Express.js
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="block text-[10px] uppercase font-mono text-zinc-400">Host Service</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate block">
                sancode-api.onrender.com
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">API Uptime:</span>
              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                {apiUptimeFormatted || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Memory (Heap):</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400">
                {memoryUsageMB ? `${memoryUsageMB.heapUsed} MB / ${memoryUsageMB.heapTotal} MB` : "—"}
              </span>
            </div>
          </div>

          {/* Database (Supabase PostgreSQL) */}
          <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-500" />
                Database Engine
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="block text-[10px] uppercase font-mono text-zinc-400">Provider</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate block">
                {database?.provider || "Supabase PostgreSQL"}
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">DB Ping Latency:</span>
              <span className={`font-mono font-semibold ${getLatencyColor(database?.latencyMs)}`}>
                {database?.latencyMs ? `${database.latencyMs} ms` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Query Runtime:</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400">
                {queryTimeMs ? `${queryTimeMs} ms` : "—"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
