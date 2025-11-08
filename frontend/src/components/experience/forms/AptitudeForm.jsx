import React from "react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Textarea } from "../../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
import { Button } from "../../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Plus, Trash2 } from "lucide-react";

export default function AptitudeForm({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const addQuestion = () => {
    const questions = data.sampleQuestions || [];
    questions.push({ question: "", answer: "" });
    handleChange("sampleQuestions", questions);
  };

  const removeQuestion = (index) => {
    const questions = [...(data.sampleQuestions || [])];
    questions.splice(index, 1);
    handleChange("sampleQuestions", questions);
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...(data.sampleQuestions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleChange("sampleQuestions", questions);
  };

  return (
    <div className="space-y-6">
      {/* Attempted / Correct / Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="attempted">Questions Attempted</Label>
          <Input
            id="attempted"
            type="number"
            placeholder="18"
            value={data.attemptedQ || ""}
            onChange={(e) => handleChange("attemptedQ", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correct">Correct Answers</Label>
          <Input
            id="correct"
            type="number"
            placeholder="16"
            value={data.correctQ || ""}
            onChange={(e) => handleChange("correctQ", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select onValueChange={(value) => handleChange("difficulty", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Sample Questions (up to 3)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            disabled={(data.sampleQuestions || []).length >= 3}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {(data.sampleQuestions || []).map((q, index) => (
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
                  placeholder="Enter the question..."
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Your Answer</Label>
                <Textarea
                  placeholder="Enter your answer..."
                  value={q.answer || ""}
                  onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Overall Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Share your experience about the aptitude round..."
          value={data.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
        />
      </div>
    </div>
  );
}
