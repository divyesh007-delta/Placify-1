import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function ApplicationsStats() {
  const stats = [
    {
      title: "Total Experiences",
      value: "12",
      icon: FileText,
      color: "text-primary",
      description: "Shared experiences",
    },
    {
      title: "In Progress",
      value: "2",
      icon: Clock,
      color: "text-accent",
      description: "Draft experiences",
    },
    {
      title: "Published",
      value: "9",
      icon: CheckCircle2,
      color: "text-chart-3",
      description: "Live experiences",
    },
    {
      title: "Under Review",
      value: "1",
      icon: XCircle,
      color: "text-chart-1",
      description: "Pending approval",
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
