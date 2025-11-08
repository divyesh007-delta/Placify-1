import React, { useEffect, useState } from "react";
import UserProfile from "../../components/profile/UserProfile";
import { UserStats } from "../../components/profile/UserStats";
import { UserActivity } from "../../components/profile/UserActivity";
import { BackButton } from "../../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <UserProfile />
            <UserActivity />
          </div>

          <div className="space-y-8">
            <UserStats />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;