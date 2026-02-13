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
import { computeReadmissions } from "./utils";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function FollowUpList({ hospitalReferrals, records }) {
  const readmissions = useMemo(
    () => computeReadmissions(records, 7).slice(0, 15),
    [records]
  );

  const isLoadingReferrals = hospitalReferrals === null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Hospital Referrals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Hospital className="h-5 w-5 text-red-500" />
            Hospital Referrals
          </CardTitle>
          {!isLoadingReferrals && hospitalReferrals?.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {hospitalReferrals.length} referred
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingReferrals ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader className="h-4 w-4 animate-spin" />
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
                  <TableRow>
                    <TableHead>Adm No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Ailment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalReferrals.slice(0, 15).map((r, i) => (
                    <TableRow key={`${r.admNo}-${i}`}>
                      <TableCell className="font-mono font-medium">
                        {r.admNo}
                      </TableCell>
                      <TableCell>
                        {r.fName || ""} {r.sName || ""}
                      </TableCell>
                      <TableCell>{r.ailment || "-"}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
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

      {/* Readmissions (needs attention) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <RotateCcw className="h-5 w-5 text-amber-500" />
            Readmissions (within 7 days)
          </CardTitle>
          {readmissions.length > 0 && (
            <Badge className="border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-200 text-xs">
              {readmissions.length} returning
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {!readmissions.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No readmissions in the last 7 days
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {readmissions.map((r, i) => (
                <div
                  key={`${r.admNo}-${r.ailment}-${i}`}
                  className="flex items-center justify-between rounded border border-slate-200 dark:border-neutral-800 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-medium">{r.admNo}</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">
                      &middot;
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {r.ailment}
                    </span>
                  </div>
                  <div className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(r.firstVisit)} &rarr; {formatDate(r.returnVisit)}
                    <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
                      ({r.daysBetween}d)
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
