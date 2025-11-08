import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Edit,
  Save,
  X,
  User,
  GraduationCap,
  Target,
  BookOpen,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    department: "",
    semester: "",
    cpi: "",
    niche: "",
    careerPath: "",
    phone: "",
    bio: "Passionate about technology and innovation.",
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/auth/user/profile");
      
      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        console.error("Failed to fetch user profile:", response.data.message);
        alert("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Error loading profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await api.put("/auth/user/profile", userData);
      
      if (response.data.success) {
        alert("✅ " + response.data.message);
        setIsEditing(false);
        // Refresh data to ensure consistency
        await fetchUserProfile();
      } else {
        alert("❌ " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ " + (error.response?.data?.message || "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Refetch original data to reset any changes
    fetchUserProfile();
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
            disabled={isSaving}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt="Profile"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {userData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={userData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{userData.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <p className="text-lg">{userData.studentId}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm">{userData.phone || "Not provided"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Select
                      value={userData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
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
                  ) : (
                    <Badge variant="secondary">{userData.department}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  {isEditing ? (
                    <Select
                      value={userData.semester}
                      onValueChange={(value) => handleInputChange("semester", value)}
                      disabled={isSaving}
                    >
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
                  ) : (
                    <p className="text-lg">{userData.semester}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Input
                    id="bio"
                    value={userData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{userData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userData.semester}</div>
              <div className="text-sm text-muted-foreground">Semester</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">{userData.cpi}</div>
              <div className="text-sm text-muted-foreground">CPI</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Specialization</Label>
              {isEditing ? (
                <Select
                  value={userData.niche}
                  onValueChange={(value) => handleInputChange("niche", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                  <div className="text-sm font-semibold">{userData.niche}</div>
                  <div className="text-sm text-muted-foreground">Specialization</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerPath">Career Path</Label>
              {isEditing ? (
                <Select
                  value={userData.careerPath}
                  onValueChange={(value) => handleInputChange("careerPath", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select career path" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Placement">Campus Placement</SelectItem>
                    <SelectItem value="Higher Studies">Higher Studies</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <User className="h-6 w-6 mx-auto mb-2 text-chart-1" />
                  <div className="text-sm font-semibold">{userData.careerPath}</div>
                  <div className="text-sm text-muted-foreground">Career Path</div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1 gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-transparent"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}