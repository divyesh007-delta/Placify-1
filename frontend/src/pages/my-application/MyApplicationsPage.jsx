import React from "react";
import ApplicationsList from "../../components/applications/ApplicationsList";
import ApplicationsStats from "../../components/applications/ApplicationsStats";
import { BackButton } from "../../components/ui/BackButton";

export default function MyApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
          <p className="text-muted-foreground text-lg">
            Track and manage your interview experiences and applications
          </p>
        </div>

        <div className="space-y-8">
          <ApplicationsStats />
          <ApplicationsList />
        </div>
      </div>
    </div>
  );
}
