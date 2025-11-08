import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Star, MapPin, Users, Building2, Calendar, Loader2 } from "lucide-react";
import api from "../../services/api";
import { Button } from "../ui/Button"; // Add this import


export function CompanyHeader({ companyId }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}`);
      
      if (response.data.success) {
        setCompany(response.data.company);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      setError("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading company data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !company) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Error: {error || "Company not found"}</p>
          <Button onClick={fetchCompanyData} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24 mx-auto md:mx-0">
            <AvatarImage src={company.logo || "/placeholder.svg"} alt={`${company.name} logo`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">{company.name}</h1>
            <p className="text-muted-foreground text-lg mb-4">{company.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Founded {company.founded}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{company.employees} employees</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{company.experienceCount} experiences</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {company.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-1 mb-2">
              <Star className="h-5 w-5 fill-current text-yellow-500" />
              <span className="text-2xl font-bold">{company.rating}</span>
            </div>
            <p className="text-sm text-muted-foreground">Overall Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}