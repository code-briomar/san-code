"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, UserCheck, Clock, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MedicationLogsTable({ medications = [] }) {
  if (!medications || medications.length === 0) return null;

  const formatTime = (ts) => {
    if (!ts) return "—";
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return ts;
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                Recent Medication Inventory Transactions
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Audited stock reductions automatically triggered when prescriptions are recorded
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {medications.length} recent logs
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/30 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Transaction Type</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Visit Ref ID</th>
                <th className="py-2.5 px-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {medications.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="py-2 px-3 whitespace-nowrap font-mono text-zinc-700 dark:text-zinc-300">
                    {formatTime(m.timestamp)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {m.change_type || "dispensation"}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {m.quantity_changed} unit(s)
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap font-mono text-zinc-500">
                    #{m.student_visit_id || "N/A"}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      {m.recorded_by || "clinic-nurse"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
