import React from "react";
import { UserTrack } from "../../components/track/UserTrack";
import { TrackStats } from "../../components/track/TrackStats";
import { BackButton } from "../../components/ui/BackButton";

function MyTrackPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Track</h1>
          <p className="text-muted-foreground text-lg">
            Overview of all companies you've applied to and your placement journey
          </p>
        </div>

        <div className="space-y-8">
          <TrackStats />
          <UserTrack />
        </div>
      </div>
    </div>
  );
}

export default MyTrackPage;
