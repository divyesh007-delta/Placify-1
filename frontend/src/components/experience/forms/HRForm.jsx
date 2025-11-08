import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Plus, Trash2 } from "lucide-react";

export function HRForm({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const addQuestion = () => {
    const questions = data.topQuestions || [];
    questions.push({ question: "", answer: "" });
    handleChange("topQuestions", questions);
  };

  const removeQuestion = (index) => {
    const questions = [...(data.topQuestions || [])];
    questions.splice(index, 1);
    handleChange("topQuestions", questions);
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...(data.topQuestions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleChange("topQuestions", questions);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Interview Duration</Label>
          <Input
            id="duration"
            placeholder="30 minutes"
            value={data.duration || ""}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Interview Experience</Label>
          <Select
            onValueChange={(value) =>
              handleChange("rating", Number.parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Rate your experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Very Difficult</SelectItem>
              <SelectItem value="2">2 - Difficult</SelectItem>
              <SelectItem value="3">3 - Moderate</SelectItem>
              <SelectItem value="4">4 - Easy</SelectItem>
              <SelectItem value="5">5 - Very Easy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Key Questions Asked</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            disabled={(data.topQuestions || []).length >= 8}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {(data.topQuestions || []).map((q, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Enter the HR question..."
                  value={q.question || ""}
                  onChange={(e) =>
                    updateQuestion(index, "question", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Your Answer</Label>
                <Textarea
                  placeholder="Describe how you answered..."
                  value={q.answer || ""}
                  onChange={(e) =>
                    updateQuestion(index, "answer", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Overall Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Share your experience about the HR interview..."
          value={data.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
        />
      </div>
    </div>
  );
}
