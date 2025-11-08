import React from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Plus, Trash2, X } from "lucide-react";

export function TechnicalForm({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const addTopic = (topic) => {
    const topics = data.focusTopics || [];
    if (!topics.includes(topic)) {
      handleChange("focusTopics", [...topics, topic]);
    }
  };

  const removeTopic = (topic) => {
    const topics = (data.focusTopics || []).filter((t) => t !== topic);
    handleChange("focusTopics", topics);
  };

  const addQuestion = () => {
    const questions = data.top5Questions || [];
    questions.push({ question: "", answer: "" });
    handleChange("top5Questions", questions);
  };

  const removeQuestion = (index) => {
    const questions = [...(data.top5Questions || [])];
    questions.splice(index, 1);
    handleChange("top5Questions", questions);
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...(data.top5Questions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleChange("top5Questions", questions);
  };

  const commonTopics = [
    "Data Structures",
    "Algorithms",
    "System Design",
    "Database Design",
    "Operating Systems",
    "Computer Networks",
    "Object-Oriented Programming",
    "Web Development",
    "Cloud Computing",
    "Microservices",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="duration">Interview Duration</Label>
          <Input
            id="duration"
            placeholder="45 minutes"
            value={data.duration || ""}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Focus Topics</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonTopics.map((topic) => (
            <Button
              key={topic}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTopic(topic)}
              disabled={(data.focusTopics || []).includes(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.focusTopics || []).map((topic) => (
            <Badge key={topic} variant="secondary" className="gap-1">
              {topic}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeTopic(topic)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Top 5 Questions Asked</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            disabled={(data.top5Questions || []).length >= 5}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {(data.top5Questions || []).map((q, index) => (
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
                  placeholder="Enter the technical question..."
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Your Answer/Discussion</Label>
                <Textarea
                  placeholder="Describe your answer and the discussion..."
                  value={q.answer || ""}
                  onChange={(e) => updateQuestion(index, "answer", e.target.value)}
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
          placeholder="Share your experience about the technical interview..."
          value={data.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
        />
      </div>
    </div>
  );
}
