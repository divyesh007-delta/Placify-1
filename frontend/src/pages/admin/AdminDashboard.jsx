import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { BarChart3, Users, Building, FileText, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Companies",
      value: "25",
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Registered Students",
      value: "150",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Interview Experiences",
      value: "89",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Analytics Reports",
      value: "12",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const quickActions = [
    {
      title: "Manage Companies",
      description: "Add, edit, or remove companies",
      path: "/admin/companies",
      icon: Building
    },
    {
      title: "User Management",
      description: "Manage student accounts",
      path: "/admin/users",
      icon: Users
    },
    {
      title: "View Analytics",
      description: "System-wide analytics",
      path: "/admin/analytics",
      icon: BarChart3
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || 'Admin'}! Here's what's happening today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-semibold text-blue-600 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start justify-start hover:bg-gray-50"
                onClick={() => window.location.href = action.path}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="font-semibold text-left">{action.title}</h3>
                <p className="text-sm text-gray-600 text-left mt-1">{action.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">New student registration</p>
                  <p className="text-sm text-gray-600">5 minutes ago</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Completed
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Company profile updated</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Updated
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;