import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, CheckCircle2 } from "lucide-react"

export function ReviewStep({ data, onUpdate, onNext, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roundNames = {
    aptitude: "Aptitude Test",
    coding: "Coding Round",
    technical: "Technical Interview",
    gd: "Group Discussion",
    hr: "HR Interview",
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onNext()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Review Your Experience
          </CardTitle>
          <p className="text-muted-foreground">Please review all the information before submitting</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Company</span>
              </div>
              <p className="text-lg">{data.companyName}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Job Role</span>
              </div>
              <p className="text-lg">{data.jobRole}</p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <span className="font-medium">Application Status</span>
            <Badge
              variant={
                data.status === "Selected" ? "default" : data.status === "Rejected" ? "destructive" : "secondary"
              }
              className="text-sm"
            >
              {data.status}
            </Badge>
          </div>

          {/* Selected Rounds */}
          <div className="space-y-3">
            <span className="font-medium">Interview Rounds Completed</span>
            <div className="flex flex-wrap gap-2">
              {data.selectedRounds.map((roundId) => (
                <Badge key={roundId} variant="outline">
                  {roundNames[roundId]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Round Data Summary */}
          <div className="space-y-4">
            <span className="font-medium">Round Details Summary</span>
            <div className="grid gap-4">
              {data.selectedRounds.map((roundId) => {
                const roundData = data.roundsData[roundId]
                if (!roundData) return null

                return (
                  <Card key={roundId} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{roundNames[roundId]}</h4>
                      <div className="text-sm text-muted-foreground">
                        {roundId === "aptitude" && (
                          <p>
                            {roundData.attemptedQ}/{roundData.correctQ} questions • {roundData.difficulty} difficulty
                          </p>
                        )}
                        {roundId === "coding" && (
                          <p>
                            {roundData.difficulty} difficulty • Languages: {roundData.languagesUsed?.join(", ")}
                          </p>
                        )}
                        {roundId === "technical" && (
                          <p>
                            {roundData.difficulty} difficulty • Topics: {roundData.focusTopics?.slice(0, 3).join(", ")}
                          </p>
                        )}
                        {roundId === "gd" && (
                          <p>
                            Topic: {roundData.topic} • Rating: {roundData.rating}/5
                          </p>
                        )}
                        {roundId === "hr" && (
                          <p>
                            Duration: {roundData.duration} • Rating: {roundData.rating}/5
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label htmlFor="overall-rating">Overall Experience Rating</Label>
            <Select
              onValueChange={(value) => onUpdate({ overallRating: parseInt(value) })}
              value={data.overallRating?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rate your overall experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Poor</SelectItem>
                <SelectItem value="2">2 - Poor</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Final Comments */}
          <div className="space-y-3">
            <Label htmlFor="final-comments">Additional Comments (Optional)</Label>
            <Textarea
              id="final-comments"
              placeholder="Any additional insights or advice for future candidates..."
              value={data.finalComments || ""}
              onChange={(e) => onUpdate({ finalComments: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !data.overallRating} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Experience"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
