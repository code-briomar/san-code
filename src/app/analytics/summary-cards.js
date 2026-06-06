import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, TrendingUp, AlertTriangle } from "lucide-react";

export default function SummaryCards({ computed, todayStats }) {
  const cards = [
    {
      key: "seen-today",
      title: "Students Seen Today",
      icon: Users,
      value: todayStats?.studentCountToday ?? 0,
      format: (v) => String(v),
    },
    {
      key: "month-visits",
      title: "Total Visits This Month",
      icon: Activity,
      value: computed?.monthTotal ?? 0,
      format: (v) => String(v),
    },
    {
      key: "top-ailment",
      title: "Top Ailment",
      icon: TrendingUp,
      value: computed?.topAilment,
      format: (v) => (v ? `${v.name} (${v.count})` : "None"),
    },
    {
      key: "outbreaks",
      title: "Outbreak Alerts",
      icon: AlertTriangle,
      value: todayStats?.outbreaks?.length ?? 0,
      format: (v) => String(v),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ key, title, icon: Icon, value, format }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
