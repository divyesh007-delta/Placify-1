import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { GraduationCap, Target, BookOpen, Upload } from "lucide-react";
import api from "../../services/api";

export default function SetupForm() {
  const [formData, setFormData] = useState({
    department: "",
    semester: "",
    cpi: "",
    niche: "",
    careerPath: "",
    resume: null, // ✅ new field for file upload
  });
  const [isLoading, setIsLoading] = useState(false);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("access_token");
      
      const response = await api.post("/auth/complete-setup", formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert("✅ " + response.data.message);
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = response.data.redirect_url || "/dashboard";
        }, 1000);
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (error) {
      alert("❌ " + (error.response?.data?.message || "Server error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select onValueChange={(value) => handleChange("department", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSE">Computer Science Engineering</SelectItem>
              <SelectItem value="IT">Information Technology</SelectItem>
              <SelectItem value="ECE">Electronics & Communication</SelectItem>
              <SelectItem value="EE">Electrical Engineering</SelectItem>
              <SelectItem value="ME">Mechanical Engineering</SelectItem>
              <SelectItem value="CE">Civil Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Current Semester</Label>
          <Select onValueChange={(value) => handleChange("semester", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3rd Semester</SelectItem>
              <SelectItem value="4">4th Semester</SelectItem>
              <SelectItem value="5">5th Semester</SelectItem>
              <SelectItem value="6">6th Semester</SelectItem>
              <SelectItem value="7">7th Semester</SelectItem>
              <SelectItem value="8">8th Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpi">Current CPI/CGPA</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="cpi"
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="8.75"
            value={formData.cpi}
            onChange={(e) => handleChange("cpi", e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="niche">Technical Niche/Interest</Label>
        <Select onValueChange={(value) => handleChange("niche", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your area of interest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Web Development">Web Development</SelectItem>
            <SelectItem value="Mobile Development">Mobile Development</SelectItem>
            <SelectItem value="AI/ML">Artificial Intelligence & Machine Learning</SelectItem>
            <SelectItem value="Data Science">Data Science & Analytics</SelectItem>
            <SelectItem value="DevOps">DevOps & Cloud Computing</SelectItem>
            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
            <SelectItem value="Blockchain">Blockchain Technology</SelectItem>
            <SelectItem value="Game Development">Game Development</SelectItem>
            <SelectItem value="UI/UX">UI/UX Design</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Career Path</Label>
        <RadioGroup
          value={formData.careerPath}
          onValueChange={(value) => handleChange("careerPath", value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="Placement" id="placement" />
            <Label
              htmlFor="placement"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Target className="h-4 w-4" />
              Campus Placement
            </Label>
          </div>
          <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="Higher Studies" id="higher-studies" />
            <Label
              htmlFor="higher-studies"
              className="flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              Higher Studies
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* ✅ Optional Resume Upload */}
      <div className="space-y-2">
        <Label htmlFor="resume">Upload Resume (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleChange("resume", e.target.files[0])}
          />
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        {formData.resume && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {formData.resume.name}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving profile..." : "Continue to Dashboard"}
      </Button>
    </form>
  );
}
