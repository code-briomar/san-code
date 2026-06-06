"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
const DISEASE_ACTIONS = {
  malaria: [
    "Schedule fumigation around school",
    "Distribute mosquito nets to affected dormitories",
    "Health education on malaria prevention",
  ],
  flu: [
    "Encourage frequent hand washing",
    "Consider temporary isolation of affected students",
    "Ensure classrooms are well ventilated",
  ],
  typhoid: [
    "Check water sources and purification",
    "Reinforce handwashing after toilet use",
    "Review cafeteria food handling and hygiene",
  ],
  diarrhea: [
    "Check water and food hygiene",
    "Ensure handwashing stations are stocked with soap",
    "Review sanitation facilities",
  ],
  cholera: [
    "Immediate water source testing",
    "Enforce boiling of drinking water",
    "Notify county health officer",
  ],
  "chest infection": [
    "Check for damp/dusty classroom conditions",
    "Ensure proper ventilation",
    "Refer severe cases to hospital",
  ],
  headache: [
    "Check for dehydration — ensure water access",
    "Monitor for stress or vision issues",
    "Review classroom lighting and ventilation",
  ],
};

const DEFAULT_ACTIONS = [
  "Monitor affected students closely",
  "Inform school administration",
  "Consider a health education session",
];

export default function ActionableAlerts({ outbreaks }) {
  const alerts = useMemo(() => {
    if (!outbreaks) return [];
    return outbreaks.map((outbreak) => {
      const ailmentLower = outbreak.ailment.toLowerCase();
      const matchedKey = Object.keys(DISEASE_ACTIONS).find((k) =>
        ailmentLower.includes(k)
      );
      const actions = DISEASE_ACTIONS[matchedKey] || DEFAULT_ACTIONS;
      return {
        ...outbreak,
        actions,
        classBreakdown: outbreak.classBreakdown || {},
      };
    });
  }, [outbreaks]);
  const [expanded, setExpanded] = useState({});

  const toggle = (ailment) =>
    setExpanded((prev) => ({ ...prev, [ailment]: !prev[ailment] }));

  if (!alerts?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Health Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>No active outbreak alerts</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Actionable Alerts
          <Badge className="ml-auto border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-200">
            {alerts.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const isOpen = expanded[alert.ailment];
          const classEntries = Object.entries(alert.classBreakdown).sort(
            (a, b) => b[1] - a[1]
          );

          return (
            <div
              key={alert.ailment}
              className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30"
            >
              <button
                onClick={() => toggle(alert.ailment)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      {alert.ailment}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      {alert.count} cases
                    </Badge>
                  </div>
                  {classEntries.length > 0 && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Concentrated in{" "}
                      {classEntries
                        .slice(0, 3)
                        .map(([cls, cnt]) => `${cls} (${cnt})`)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-amber-200 dark:border-amber-800 px-3 pb-3 pt-2">
                  <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400 mb-2">
                    Suggested actions
                  </p>
                  <ul className="space-y-1.5">
                    {alert.actions.map((action, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {action}
                      </li>
                    ))}
                  </ul>

                  {classEntries.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400 mb-1.5">
                        Class breakdown
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {classEntries.map(([cls, cnt]) => (
                          <Badge
                            key={cls}
                            variant="outline"
                            className="border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                          >
                            {cls}: {cnt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
