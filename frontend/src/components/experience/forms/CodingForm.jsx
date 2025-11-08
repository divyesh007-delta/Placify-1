import React from "react";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Textarea } from "../../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
import { Button } from "../../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Plus, Trash2, X } from "lucide-react";

export default function CodingForm({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const addLanguage = (language) => {
    const languages = data.languagesUsed || [];
    if (!languages.includes(language)) {
      handleChange("languagesUsed", [...languages, language]);
    }
  };

  const removeLanguage = (language) => {
    const languages = (data.languagesUsed || []).filter((l) => l !== language);
    handleChange("languagesUsed", languages);
  };

  const addQuestion = () => {
    const questions = data.top3Questions || [];
    questions.push({ question: "", answer: "" });
    handleChange("top3Questions", questions);
  };

  const removeQuestion = (index) => {
    const questions = [...(data.top3Questions || [])];
    questions.splice(index, 1);
    handleChange("top3Questions", questions);
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...(data.top3Questions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleChange("top3Questions", questions);
  };

  const commonLanguages = ["Java", "Python", "C++", "JavaScript", "C", "Go", "Rust"];

  return (
    <div className="space-y-6">
      {/* Difficulty + Time */}
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
          <Label htmlFor="time-limit">Time Limit</Label>
          <Input
            id="time-limit"
            placeholder="90 minutes"
            value={data.timeLimit || ""}
            onChange={(e) => handleChange("timeLimit", e.target.value)}
          />
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label>Programming Languages Used</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonLanguages.map((lang) => (
            <Button
              key={lang}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLanguage(lang)}
              disabled={(data.languagesUsed || []).includes(lang)}
            >
              {lang}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.languagesUsed || []).map((lang) => (
            <Badge key={lang} variant="secondary" className="gap-1">
              {lang}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeLanguage(lang)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Top 3 Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Top 3 Questions</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            disabled={(data.top3Questions || []).length >= 3}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {(data.top3Questions || []).map((q, index) => (
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
                <Label>Problem Statement</Label>
                <Textarea
                  placeholder="Describe the coding problem..."
                  value={q.question || ""}
                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Your Approach/Solution</Label>
                <Textarea
                  placeholder="Explain your approach and solution..."
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
          placeholder="Share your experience about the coding round..."
          value={data.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
        />
      </div>
    </div>
  );
}
