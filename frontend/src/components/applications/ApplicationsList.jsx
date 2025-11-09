import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Edit, Eye, Trash2, Calendar, Building2 } from "lucide-react";

export default function ApplicationsList() {
  const [applications] = useState([
    {
      id: "1",
      companyName: "Google",
      companyLogo: "/google-logo.png",
      jobRole: "Software Development Engineer",
      status: "Published",
      submittedDate: "2024-01-15",
      lastUpdated: "2024-01-16",
      rounds: ["Aptitude", "Coding", "Technical", "HR"],
      overallRating: 4,
      views: 45,
      likes: 12,
    },
    {
      id: "2",
      companyName: "Microsoft",
      companyLogo: "/microsoft-logo.png",
      jobRole: "Software Engineer",
      status: "Under Review",
      submittedDate: "2024-01-20",
      lastUpdated: "2024-01-20",
      rounds: ["Coding", "Technical", "HR"],
      overallRating: 5,
      views: 0,
      likes: 0,
    },
    {
      id: "3",
      companyName: "Amazon",
      companyLogo: "/amazon-logo.png",
      jobRole: "SDE Intern",
      status: "Draft",
      submittedDate: null,
      lastUpdated: "2024-01-22",
      rounds: ["Aptitude", "Coding"],
      overallRating: 0,
      views: 0,
      likes: 0,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "default";
      case "Under Review":
        return "secondary";
      case "Draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const filterApplications = (status) => {
    if (status === "all") return applications;
    return applications.filter((app) => app.status.toLowerCase() === status);
  };

  const ApplicationCard = ({ application }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={application.companyLogo || "/placeholder.svg"}
                alt={application.companyName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {application.companyName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{application.companyName}</h3>
              <p className="text-muted-foreground">{application.jobRole}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {application.rounds.map((round) => (
            <Badge key={round} variant="outline" className="text-xs">
              {round}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {application.submittedDate
                ? `Submitted ${new Date(application.submittedDate).toLocaleDateString()}`
                : "Not submitted"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>Updated {new Date(application.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>

        {application.status === "Published" && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{application.views} views</span>
            <span>{application.likes} likes</span>
            <span>Rating: {application.overallRating}/5</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {application.status === "Draft" ? (
            <Button size="sm" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Continue Editing
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              View Experience
            </Button>
          )}

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive gap-2 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="published">
              Published ({filterApplications("published").length})
            </TabsTrigger>
            <TabsTrigger value="under review">
              Under Review ({filterApplications("under review").length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({filterApplications("draft").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="published" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filterApplications("published").map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="under review" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filterApplications("under review").map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filterApplications("draft").map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
