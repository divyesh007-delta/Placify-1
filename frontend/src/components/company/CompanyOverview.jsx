import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { IndianRupee, TrendingUp, Users, Award, Loader2 } from "lucide-react";
import api from "../../services/api";

export function CompanyOverview({ companyId }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyOverview();
  }, [companyId]);

  const fetchCompanyOverview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}/overview`);
      
      if (response.data.success) {
        setOverview(response.data.overview);
      }
    } catch (error) {
      console.error("Error fetching company overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading overview...</span>
        </CardContent>
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>No overview data available</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { title: "Success Rate", value: `${overview.stats.successRate}%`, icon: TrendingUp, color: "text-chart-3" },
    { title: "Total Hired", value: overview.stats.totalHired, icon: Users, color: "text-primary" },
    { title: "Avg Package", value: `₹${overview.stats.avgPackage} LPA`, icon: IndianRupee, color: "text-accent" },
    { title: "Difficulty", value: overview.stats.difficulty, icon: Award, color: "text-chart-1" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Roles & Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.jobRoles.map((role, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{role.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.requirements.map((req) => (
                        <Badge key={req} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-primary text-lg">₹{role.avgPackage} LPA</div>
                      <div className="text-muted-foreground">Avg Package</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{role.positions}</div>
                      <div className="text-muted-foreground">Positions</div>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{role.bondInfo}</Badge>
                    </div>
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