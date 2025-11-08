// pages/sub-admin/SubAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Building2, FileText, Users, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function SubAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingExperiences: 0,
    pendingProfiles: 0,
    companiesCreated: 0,
    experiencesVerified: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingExperiencesPreview, setPendingExperiencesPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, experiencesRes] = await Promise.all([
        api.get('/sub-admin/dashboard/stats'),
        api.get('/sub-admin/dashboard/recent-activity'),
        api.get('/sub-admin/dashboard/pending-experiences')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (activityRes.data.success) {
        setRecentActivity(activityRes.data.recent_activity);
      }

      if (experiencesRes.data.success) {
        setPendingExperiencesPreview(experiencesRes.data.pending_experiences);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    {
      title: "Create Company",
      description: "Add new company profile",
      icon: Building2,
      action: () => navigate('/sub-admin/create-company'),
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Verify Experiences",
      description: "Review interview experiences",
      icon: FileText,
      action: () => navigate('/sub-admin/verify-experiences'),
      color: "text-green-600 bg-green-100",
      badge: stats.pendingExperiences > 0 ? stats.pendingExperiences : null
    },
    {
      title: "Verify Profiles",
      description: "Approve student profiles",
      icon: Users,
      action: () => navigate('/sub-admin/verify-profiles'),
      color: "text-purple-600 bg-purple-100",
      badge: stats.pendingProfiles > 0 ? stats.pendingProfiles : null
    }
  ];

  // Icon mapping for recent activity
  const iconMap = {
    CheckCircle,
    Building2,
    Users
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sub Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}. Manage placement portal content and verifications.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Experiences</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExperiences}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProfiles}</div>
              <p className="text-xs text-muted-foreground">
                Need approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies Created</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.companiesCreated}</div>
              <p className="text-xs text-muted-foreground">
                By you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experiences Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.experiencesVerified}</div>
              <p className="text-xs text-muted-foreground">
                Total approved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                      {action.badge && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Experiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span>Pending Experiences</span>
                {stats.pendingExperiences > 0 && (
                  <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded-full">
                    {stats.pendingExperiences}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Interview experiences waiting for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingExperiencesPreview.length > 0 ? (
                <div className="space-y-3">
                  {pendingExperiencesPreview.map((experience) => (
                    <div key={experience.experience_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{experience.company_name} - {experience.job_role}</p>
                        <p className="text-sm text-gray-600">Submitted by {experience.user_id}</p>
                        <p className="text-xs text-gray-500">Created: {formatDate(experience.created_at)}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/sub-admin/verify-experiences')}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p>All experiences are verified!</p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/sub-admin/verify-experiences')}
              >
                View All Pending Experiences
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions as sub admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const IconComponent = iconMap[activity.icon] || CheckCircle;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                        <div className="flex-1">
                          <p className="font-medium">{activity.message}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No recent activity</p>
                    <p className="text-sm">Your activities will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Sub Admin Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Verify experiences only if they contain genuine interview details and are helpful for other students</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Ensure company profiles contain accurate information about roles, packages, and requirements</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Verify student profiles only after confirming the academic information is correct</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Contact super admin for any suspicious content or issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}