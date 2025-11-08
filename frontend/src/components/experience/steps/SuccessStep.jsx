import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { CheckCircle2, Share2, Home, Plus } from "lucide-react";

export function SuccessStep() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Experience Submitted Successfully!
          </CardTitle>
          <p className="text-muted-foreground">
            Thank you for sharing your interview experience. Your insights will
            help fellow students prepare better.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Your experience will be reviewed by our team</li>
              <li>• It will be published within 24-48 hours</li>
              <li>• Other students can benefit from your insights</li>
              <li>• You'll earn contribution points for helping the community</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 gap-2">
              <a href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <a href="/submit-experience" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Share Another Experience
              </a>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Help spread the word about Placement Guide
            </p>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              Share with Friends
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
