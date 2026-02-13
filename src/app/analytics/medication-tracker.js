"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill, Clock, CheckCircle2 } from "lucide-react";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function MedicationTracker({ medicationDue }) {
  const currentHour = new Date().getHours();
  const isBeforeNoon = currentHour < 12;

  return (
    <Card className="border-orange-300 dark:border-orange-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Pill className="h-5 w-5 text-orange-500" />
          Medication Reminders
        </CardTitle>
        {!isBeforeNoon && medicationDue?.length > 0 && (
          <span className="rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-sm font-medium text-orange-700 dark:text-orange-300">
            {medicationDue.length} pending
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isBeforeNoon ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span>Medication tracking activates after noon</span>
          </div>
        ) : !medicationDue?.length ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>All medication follow-ups complete</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adm No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Morning Dose</TableHead>
                  <TableHead>Ailment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicationDue.map((record, i) => (
                  <TableRow key={`${record.admNo}-${i}`}>
                    <TableCell className="font-mono font-medium">
                      {record.admNo}
                    </TableCell>
                    <TableCell>
                      {record.fName || ""} {record.sName || ""}
                    </TableCell>
                    <TableCell className="font-medium text-orange-700 dark:text-orange-300">
                      {record.medication}
                    </TableCell>
                    <TableCell>{formatTime(record.timestamp)}</TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {record.ailment || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
