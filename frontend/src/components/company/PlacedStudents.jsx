import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IndianRupee, Calendar, Award, Loader2 } from "lucide-react";
import api from "../../services/api";

export function PlacedStudents({ companyId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlacedStudents();
  }, [companyId]);

  const fetchPlacedStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}/placed-students`);
      
      if (response.data.success) {
        setData({
          placedStudents: response.data.placedStudents,
          stats: response.data.stats
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching placed students:", error);
      setError("Failed to load placed students data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Total Placed", value: data?.stats?.totalPlaced || "0", icon: Award },
    { title: "Highest Package", value: `₹${data?.stats?.highestPackage || "0"} LPA`, icon: IndianRupee },
    { title: "This Year", value: data?.stats?.thisYear || "0", icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading placement data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">Error: {error || "No placement data available"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placement Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
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
          <CardTitle>Recently Placed Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.placedStudents && data.placedStudents.map((student, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {student.studentId} • {student.department}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{student.role}</Badge>
                    <Badge variant="outline" className="text-xs">CPI: {student.cpi}</Badge>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-primary">₹{student.package} LPA</div>
                  <div className="text-sm text-muted-foreground">{student.year}</div>
                </div>
              </div>
            ))}
            {(!data.placedStudents || data.placedStudents.length === 0) && (
              <p className="text-center text-muted-foreground py-4">No placement data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}