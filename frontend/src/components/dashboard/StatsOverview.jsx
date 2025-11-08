import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Building2, Users, TrendingUp, Star } from "lucide-react"

export function StatsOverview() {
  const stats = [
    {
      title: "Total Companies",
      value: "150+",
      description: "Active recruiters",
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Student Experiences",
      value: "2,340",
      description: "Shared insights",
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Success Rate",
      value: "78%",
      description: "Placement success",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      title: "Average Rating",
      value: "4.2",
      description: "Company reviews",
      icon: Star,
      color: "text-chart-2",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
