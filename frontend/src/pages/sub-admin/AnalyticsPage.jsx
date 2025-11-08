// pages/super-admin/AnalyticsPage.jsx
import React from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, TrendingUp, Target } from 'lucide-react';

const placementData = [
  { department: 'Computer', placed: 45, total: 60 },
  { department: 'IT', placed: 38, total: 55 },
  { department: 'Mechanical', placed: 28, total: 50 },
  { department: 'Civil', placed: 22, total: 45 },
  { department: 'Electrical', placed: 25, total: 40 },
];

const packageData = [
  { range: '0-10 LPA', students: 15 },
  { range: '10-20 LPA', students: 45 },
  { range: '20-30 LPA', students: 25 },
  { range: '30+ LPA', students: 8 },
];

const companyData = [
  { name: 'Google', hires: 12 },
  { name: 'Microsoft', hires: 8 },
  { name: 'Amazon', hires: 15 },
  { name: 'TCS', hires: 20 },
  { name: 'Infosys', hires: 18 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Placement Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of placement statistics and trends
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Registered for placement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                Current academic year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56</div>
              <p className="text-xs text-muted-foreground">
                Active recruiters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Package</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5 LPA</div>
              <p className="text-xs text-muted-foreground">
                Highest: 42 LPA
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department-wise Placement */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Placement</CardTitle>
              <CardDescription>
                Placement statistics across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={placementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="placed" fill="#8884d8" name="Placed Students" />
                  <Bar dataKey="total" fill="#82ca9d" name="Total Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Package Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Package Distribution</CardTitle>
              <CardDescription>
                Distribution of offered packages (LPA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={packageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, students }) => `${range}: ${students}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {packageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Hiring Companies */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Hiring Companies</CardTitle>
              <CardDescription>
                Companies with highest number of hires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hires" fill="#ffc658" name="Number of Hires" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gender Diversity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Male</span>
                  <span>65%</span>
                </div>
                <div className="flex justify-between">
                  <span>Female</span>
                  <span>35%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internship Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">72%</div>
              <p className="text-sm text-gray-600">PPO Conversion Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highest Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">42 LPA</div>
              <p className="text-sm text-gray-600">Google - SDE Role</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}