import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Building2, Target, TrendingUp, Calendar } from "lucide-react";

export function TrackStats() {
  const stats = [
    {
      title: "Companies Applied",
      value: "8",
      icon: Building2,
      color: "text-primary",
      description: "Total applications",
    },
    {
      title: "Interviews Attended",
      value: "12",
      icon: Target,
      color: "text-accent",
      description: "Interview rounds",
    },
    {
      title: "Success Rate",
      value: "75%",
      icon: TrendingUp,
      color: "text-chart-3",
      description: "Interview success",
    },
    {
      title: "Active Applications",
      value: "3",
      icon: Calendar,
      color: "text-chart-1",
      description: "Ongoing processes",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
