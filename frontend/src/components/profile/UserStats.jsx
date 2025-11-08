import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, Building2, Award, TrendingUp } from "lucide-react";

export function UserStats() {
  const stats = [
    {
      title: "Experiences Shared",
      value: "12",
      icon: FileText,
      color: "text-primary",
      description: "Interview experiences",
    },
    {
      title: "Companies Applied",
      value: "8",
      icon: Building2,
      color: "text-accent",
      description: "Total applications",
    },
    {
      title: "Success Rate",
      value: "75%",
      icon: TrendingUp,
      color: "text-chart-3",
      description: "Interview success",
    },
    {
      title: "Community Points",
      value: "340",
      icon: Award,
      color: "text-chart-2",
      description: "Contribution score",
    },
  ];

  const achievements = [
    { name: "First Experience", description: "Shared your first interview experience" },
    { name: "Helpful Contributor", description: "Received 10+ helpful votes" },
    { name: "Company Explorer", description: "Applied to 5+ different companies" },
    { name: "Detail Master", description: "Provided comprehensive round details" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div className="flex-1">
                  <div className="font-semibold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <Award className="h-5 w-5 text-chart-2 mt-0.5" />
                <div>
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
