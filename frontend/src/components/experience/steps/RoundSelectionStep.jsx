import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Users, Code, Brain, MessageSquare, Target } from "lucide-react"

export function RoundsSelectionStep({ data, onUpdate, onNext, onBack }) {
  const rounds = [
    { id: "aptitude", name: "Aptitude Test", description: "Quantitative, Logical, and Verbal reasoning", icon: Brain, color: "text-blue-500" },
    { id: "coding", name: "Coding Round", description: "Data structures and algorithms problems", icon: Code, color: "text-green-500" },
    { id: "technical", name: "Technical Interview", description: "CS fundamentals and system design", icon: Target, color: "text-purple-500" },
    { id: "gd", name: "Group Discussion", description: "Topic-based group discussion", icon: Users, color: "text-orange-500" },
    { id: "hr", name: "HR Interview", description: "Behavioral and cultural fit questions", icon: MessageSquare, color: "text-pink-500" },
  ]

  const handleRoundToggle = (roundId, checked) => {
    const updatedRounds = checked
      ? [...data.selectedRounds, roundId]
      : data.selectedRounds.filter((id) => id !== roundId)

    onUpdate({ selectedRounds: updatedRounds })
  }

  const handleNext = () => {
    if (data.selectedRounds.length > 0) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Rounds</CardTitle>
        <p className="text-muted-foreground">Select all the rounds you participated in during the interview process</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            {rounds.map((round) => {
              const isSelected = data.selectedRounds.includes(round.id)
              return (
                <div
                  key={round.id}
                  className={`border rounded-lg p-4 transition-colors cursor-pointer hover:bg-muted/50 ${isSelected ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => handleRoundToggle(round.id, !isSelected)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <round.icon className={`h-6 w-6 ${round.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{round.name}</h3>
                        {isSelected && <Badge variant="secondary">Selected</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{round.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {data.selectedRounds.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected Rounds ({data.selectedRounds.length})</h4>
              <div className="flex flex-wrap gap-2">
                {data.selectedRounds.map((roundId) => {
                  const round = rounds.find((r) => r.id === roundId)
                  return (
                    <Badge key={roundId} variant="secondary">
                      {round?.name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={handleNext} disabled={data.selectedRounds.length === 0} className="flex-1">
              Continue to Round Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
