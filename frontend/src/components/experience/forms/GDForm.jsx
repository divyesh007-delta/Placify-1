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

export function GDForm({ data, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">Discussion Topic</Label>
        <Input
          id="topic"
          placeholder="e.g., Impact of AI on Employment"
          value={data.topic || ""}
          onChange={(e) => handleChange("topic", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="abstract">Topic Abstract/Background</Label>
        <Textarea
          id="abstract"
          placeholder="Brief background or context provided for the topic..."
          value={data.abstract || ""}
          onChange={(e) => handleChange("abstract", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="your-points">Your Key Points</Label>
        <Textarea
          id="your-points"
          placeholder="List the main points you made during the discussion..."
          value={data.yourPoints || ""}
          onChange={(e) => handleChange("yourPoints", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="best-answer">Best Answer by Others</Label>
        <Textarea
          id="best-answer"
          placeholder="Describe the most impressive point made by another participant..."
          value={data.bestAnswer || ""}
          onChange={(e) => handleChange("bestAnswer", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Your Performance Rating</Label>
          <Select
            onValueChange={(value) =>
              handleChange("rating", Number.parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Rate yourself" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Poor</SelectItem>
              <SelectItem value="2">2 - Below Average</SelectItem>
              <SelectItem value="3">3 - Average</SelectItem>
              <SelectItem value="4">4 - Good</SelectItem>
              <SelectItem value="5">5 - Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Discussion Duration</Label>
          <Input
            id="duration"
            placeholder="20 minutes"
            value={data.duration || ""}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Overall Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Share your experience about the group discussion..."
          value={data.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
        />
      </div>
    </div>
  );
}
