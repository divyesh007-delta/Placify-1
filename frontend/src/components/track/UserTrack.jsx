import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Calendar, MapPin, IndianRupee, Eye, ExternalLink } from "lucide-react";

export function UserTrack() {
  const applications = [
    {
      id: "1",
      companyName: "Google",
      companyLogo: "/google-logo.png",
      jobRole: "Software Development Engineer",
      location: "Bangalore",
      appliedDate: "2024-01-10",
      status: "Selected",
      currentStage: "Offer Received",
      package: "45 LPA",
      rounds: ["Aptitude", "Coding", "Technical", "HR"],
      completedRounds: 4,
    },
    {
      id: "2",
      companyName: "Microsoft",
      companyLogo: "/microsoft-logo.png",
      jobRole: "Software Engineer",
      location: "Hyderabad",
      appliedDate: "2024-01-15",
      status: "In Progress",
      currentStage: "Technical Interview",
      package: "42 LPA",
      rounds: ["Coding", "Technical", "HR"],
      completedRounds: 1,
    },
    {
      id: "3",
      companyName: "Amazon",
      companyLogo: "/amazon-logo.png",
      jobRole: "SDE Intern",
      location: "Mumbai",
      appliedDate: "2024-01-20",
      status: "Rejected",
      currentStage: "Coding Round",
      package: "38 LPA",
      rounds: ["Aptitude", "Coding"],
      completedRounds: 2,
    },
    {
      id: "4",
      companyName: "Flipkart",
      companyLogo: "/flipkart-logo.png",
      jobRole: "Software Engineer",
      location: "Bangalore",
      appliedDate: "2024-01-25",
      status: "In Progress",
      currentStage: "HR Interview",
      package: "28 LPA",
      rounds: ["Aptitude", "Coding", "Technical", "HR"],
      completedRounds: 3,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Selected":
        return "default";
      case "In Progress":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getProgressPercentage = (completed, total) => {
    return (completed / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Timeline</CardTitle>
        <p className="text-muted-foreground">
          Track your application progress across different companies
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Company Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={application.companyLogo || "/placeholder.svg"}
                      alt={application.companyName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {application.companyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {application.companyName}
                        </h3>
                        <p className="text-muted-foreground">
                          {application.jobRole}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied{" "}
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {application.package}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          Current Stage:{" "}
                          <strong>{application.currentStage}</strong>
                        </span>
                        <span>
                          {application.completedRounds}/
                          {application.rounds.length} rounds completed
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(
                              application.completedRounds,
                              application.rounds.length
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {application.rounds.map((round, roundIndex) => (
                        <Badge
                          key={round}
                          variant={
                            roundIndex < application.completedRounds
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {round}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Company Page
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
