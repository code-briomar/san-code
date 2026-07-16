"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader, Hospital, RotateCcw } from "lucide-react";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function FollowUpList({ hospitalReferrals = null, readmissions = [] }) {
  const recentReadmissions = useMemo(
    () => (readmissions || []).slice(0, 15),
    [readmissions]
  );

  const isLoadingReferrals = hospitalReferrals === null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Hospital Referrals */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <Hospital className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            Hospital Referrals
          </CardTitle>
          {!isLoadingReferrals && hospitalReferrals?.length > 0 && (
            <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-slate-150 border-slate-300 dark:border-zinc-700">
              {hospitalReferrals.length} referred
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingReferrals ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader className="h-4 w-4 animate-spin text-slate-900 dark:text-slate-150" />
              Loading referrals...
            </div>
          ) : !hospitalReferrals?.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No students currently referred to hospital
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead className="text-slate-700 dark:text-slate-350">Adm No</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-350">Name</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-350">Ailment</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-350">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalReferrals.slice(0, 15).map((r, i) => (
                    <TableRow key={`${r.admNo}-${i}`} className="border-b border-zinc-150 dark:border-zinc-800">
                      <TableCell className="font-mono font-medium text-slate-800 dark:text-slate-250">
                        {r.admNo}
                      </TableCell>
                      <TableCell className="text-slate-800 dark:text-slate-250">
                        {r.fName || ""} {r.sName || ""}
                      </TableCell>
                      <TableCell className="text-slate-800 dark:text-slate-250">{r.ailment || "-"}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-450">
                        {r.timestamp ? formatDate(r.timestamp) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readmissions */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <RotateCcw className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            Readmissions (within 7 days)
          </CardTitle>
          {recentReadmissions.length > 0 && (
            <Badge variant="outline" className="border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-slate-200 text-xs">
              {recentReadmissions.length} returning
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!recentReadmissions.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No readmissions in the last 7 days
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentReadmissions.map((r, i) => (
                <div
                  key={`${r.admNo}-${r.ailment}-${i}`}
                  className="flex items-center justify-between rounded border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-250">{r.admNo}</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-650">
                      &middot;
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {r.ailment}
                    </span>
                  </div>
                  <div className="shrink-0 text-xs text-slate-500 dark:text-slate-450 font-medium">
                    {formatDate(r.firstVisit)} &rarr; {formatDate(r.returnVisit)}
                    <span className="ml-1.5 font-mono text-[10px] bg-slate-100 dark:bg-zinc-850 px-1 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800">
                      {r.daysBetween}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
