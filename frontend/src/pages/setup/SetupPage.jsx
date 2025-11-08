import React from "react";
import SetupForm from "../../components/setup/SetupForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Help us personalize your experience
          </p>
          {/* <Progress value={33} className="w-full mt-4" />
          <p className="text-sm text-muted-foreground mt-2">Step 1 of 3</p> */}
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Academic Details</CardTitle>
            <CardDescription>
              Tell us about your academic background and career interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
