import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Calendar, MessageSquare, ThumbsUp, Eye } from "lucide-react";

export function UserActivity() {
  const activities = [
    {
      type: "experience",
      title: "Shared Google SDE experience",
      description: "Detailed coding round and technical interview insights",
      date: "2 days ago",
      stats: { views: 45, likes: 12, comments: 3 },
    },
    {
      type: "experience",
      title: "Updated Microsoft experience",
      description: "Added HR round details and final feedback",
      date: "1 week ago",
      stats: { views: 32, likes: 8, comments: 1 },
    },
    {
      type: "experience",
      title: "Shared Amazon experience",
      description: "Complete interview process from aptitude to HR",
      date: "2 weeks ago",
      stats: { views: 78, likes: 23, comments: 7 },
    },
    {
      type: "comment",
      title: "Commented on Flipkart experience",
      description: "Provided additional insights about the coding round",
      date: "3 weeks ago",
      stats: { likes: 5 },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="You"
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  JD
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <Badge
                    variant={activity.type === "experience" ? "default" : "secondary"}
                  >
                    {activity.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {activity.date}
                  </div>
                  {activity.stats.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {activity.stats.views}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {activity.stats.likes}
                  </div>
                  {activity.stats.comments && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {activity.stats.comments}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
