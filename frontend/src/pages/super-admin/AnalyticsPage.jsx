// pages/super-admin/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Users, Building2, TrendingUp, Target, DollarSign, Calendar, 
  Download, Filter, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import api from '../../services/api';

// Mock data - replace with actual API calls
const departmentData = [
  { department: 'Computer Engineering', placed: 45, total: 60, percentage: 75, avgPackage: 18.5 },
  { department: 'IT Engineering', placed: 38, total: 55, percentage: 69, avgPackage: 16.2 },
  { department: 'Mechanical Engineering', placed: 28, total: 50, percentage: 56, avgPackage: 12.8 },
  { department: 'Civil Engineering', placed: 22, total: 45, percentage: 49, avgPackage: 11.5 },
  { department: 'Electrical Engineering', placed: 25, total: 40, percentage: 62.5, avgPackage: 13.2 },
  { department: 'EC Engineering', placed: 18, total: 35, percentage: 51.4, avgPackage: 14.1 },
];

const packageDistribution = [
  { range: '0-5 LPA', students: 8, color: '#FF6B6B' },
  { range: '5-10 LPA', students: 25, color: '#4ECDC4' },
  { range: '10-15 LPA', students: 45, color: '#45B7D1' },
  { range: '15-20 LPA', students: 35, color: '#96CEB4' },
  { range: '20-30 LPA', students: 20, color: '#FFEAA7' },
  { range: '30+ LPA', students: 12, color: '#DDA0DD' },
];

const monthlyTrends = [
  { month: 'Jul', applications: 120, interviews: 45, offers: 15 },
  { month: 'Aug', applications: 180, interviews: 68, offers: 22 },
  { month: 'Sep', applications: 220, interviews: 85, offers: 30 },
  { month: 'Oct', applications: 280, interviews: 110, offers: 42 },
  { month: 'Nov', applications: 320, interviews: 135, offers: 55 },
  { month: 'Dec', applications: 380, interviews: 160, offers: 68 },
  { month: 'Jan', applications: 420, interviews: 185, offers: 78 },
  { month: 'Feb', applications: 380, interviews: 165, offers: 72 },
  { month: 'Mar', applications: 350, interviews: 150, offers: 65 },
];

const topCompanies = [
  { name: 'Google', hires: 12, avgPackage: 32.5, visits: 3 },
  { name: 'Microsoft', hires: 8, avgPackage: 28.8, visits: 2 },
  { name: 'Amazon', hires: 15, avgPackage: 26.2, visits: 4 },
  { name: 'TCS', hires: 20, avgPackage: 8.5, visits: 2 },
  { name: 'Infosys', hires: 18, avgPackage: 7.8, visits: 2 },
  { name: 'Adobe', hires: 6, avgPackage: 24.5, visits: 1 },
  { name: 'Goldman Sachs', hires: 5, avgPackage: 35.2, visits: 1 },
];

const placementTrends = [
  { year: '2020', placed: 158, total: 220, percentage: 71.8 },
  { year: '2021', placed: 172, total: 235, percentage: 73.2 },
  { year: '2022', placed: 185, total: 245, percentage: 75.5 },
  { year: '2023', placed: 198, total: 250, percentage: 79.2 },
  { year: '2024', placed: 215, total: 265, percentage: 81.1 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('current_year');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Calculate overall statistics
  const overallStats = {
    totalStudents: departmentData.reduce((sum, dept) => sum + dept.total, 0),
    totalPlaced: departmentData.reduce((sum, dept) => sum + dept.placed, 0),
    overallPercentage: Math.round((departmentData.reduce((sum, dept) => sum + dept.placed, 0) / 
                                 departmentData.reduce((sum, dept) => sum + dept.total, 0)) * 100),
    avgPackage: Math.round(departmentData.reduce((sum, dept) => sum + dept.avgPackage, 0) / departmentData.length * 10) / 10,
    totalCompanies: topCompanies.length,
    highestPackage: 42.5, // From Goldman Sachs
  };

  const exportData = (format) => {
    // In real app, this would generate and download reports
    alert(`Exporting analytics data as ${format.toUpperCase()}`);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Placement Analytics</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights and statistics for the placement cell
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_year">Current Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="last_3_years">Last 3 Years</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportData('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {['overview', 'department', 'companies', 'trends'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalStudents}</div>
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
                  <div className="text-2xl font-bold">{overallStats.overallPercentage}%</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={overallStats.overallPercentage >= 75 ? "default" : "secondary"}>
                      {overallStats.overallPercentage >= 75 ? 'Excellent' : 'Good'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {overallStats.totalPlaced} placed
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Package</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.avgPackage} LPA</div>
                  <p className="text-xs text-muted-foreground">
                    Highest: {overallStats.highestPackage} LPA
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">
                    Active recruiters
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department-wise Placement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Department-wise Placement</span>
                  </CardTitle>
                  <CardDescription>
                    Placement statistics across engineering departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
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
                  <CardTitle className="flex items-center space-x-2">
                    <PieChartIcon className="h-5 w-5 text-green-600" />
                    <span>Package Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Distribution of offered packages (LPA)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={packageDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, students }) => `${range}: ${students}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="students"
                      >
                        {packageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Placement Trends</CardTitle>
                  <CardDescription>
                    Applications, interviews, and offers throughout the year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="interviews" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="offers" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Year-over-Year Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year Growth</CardTitle>
                  <CardDescription>
                    Placement trends over the last 5 years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={placementTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="placed" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="percentage" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Department-wise Analytics Tab */}
        {activeTab === 'department' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Detailed Analysis</CardTitle>
                <CardDescription>
                  Comprehensive placement data for each engineering department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departmentData.map((dept, index) => (
                    <div key={dept.department} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{dept.department}</h3>
                        <Badge className={getStatusColor(dept.percentage)}>
                          {dept.percentage}% Placement
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{dept.placed}</div>
                          <div className="text-sm text-gray-600">Placed Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{dept.total}</div>
                          <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{dept.percentage}%</div>
                          <div className="text-sm text-gray-600">Placement Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{dept.avgPackage} LPA</div>
                          <div className="text-sm text-gray-600">Avg Package</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>

                      {/* Top Recruiters for Department */}
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Top Recruiters</h4>
                        <div className="flex flex-wrap gap-2">
                          {topCompanies.slice(0, 4).map((company, idx) => (
                            <Badge key={idx} variant="outline">
                              {company.name} ({company.hires} hires)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Companies Analytics Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company-wise Analytics</CardTitle>
                <CardDescription>
                  Detailed analysis of recruiting companies and their hiring patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Top Companies Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCompanies} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hires" name="Number of Hires" fill="#8884d8" />
                        <Bar dataKey="avgPackage" name="Avg Package (LPA)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Companies Table */}
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-medium">Company</th>
                          <th className="text-left p-4 font-medium">Hires</th>
                          <th className="text-left p-4 font-medium">Avg Package</th>
                          <th className="text-left p-4 font-medium">Campus Visits</th>
                          <th className="text-left p-4 font-medium">Success Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCompanies.map((company, index) => (
                          <tr key={company.name} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{company.name}</td>
                            <td className="p-4">{company.hires}</td>
                            <td className="p-4">{company.avgPackage} LPA</td>
                            <td className="p-4">{company.visits}</td>
                            <td className="p-4">
                              <Badge variant={
                                company.avgPackage > 20 ? "default" : 
                                company.avgPackage > 15 ? "secondary" : "outline"
                              }>
                                {company.avgPackage > 20 ? 'Premium' : 
                                 company.avgPackage > 15 ? 'Good' : 'Standard'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trends Analytics Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placement Trends Over Years */}
              <Card>
                <CardHeader>
                  <CardTitle>5-Year Placement Trends</CardTitle>
                  <CardDescription>
                    Growth in placement numbers and percentages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={placementTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="placed" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Placed Students"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Placement %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Package Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Package Trends</CardTitle>
                  <CardDescription>
                    Average package growth over the years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { year: '2020', avg: 12.5, high: 28.0 },
                      { year: '2021', avg: 13.8, high: 32.5 },
                      { year: '2022', avg: 15.2, high: 36.0 },
                      { year: '2023', avg: 16.8, high: 39.5 },
                      { year: '2024', avg: 18.5, high: 42.5 },
                    ].map((trend) => (
                      <div key={trend.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{trend.year}</span>
                          <div className="text-sm text-gray-600">
                            Avg: {trend.avg} LPA | High: {trend.high} LPA
                          </div>
                        </div>
                        <Badge variant={trend.avg > 16 ? "default" : "secondary"}>
                          +{((trend.avg - 12.5) / 12.5 * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights and Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
                <CardDescription>
                  Analysis and suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">Strengths</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        <span>Computer Engineering shows excellent placement rate (75%)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        <span>Strong presence of top tech companies (Google, Microsoft, Amazon)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        <span>Consistent year-over-year growth in placement percentages</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                        <span>Civil Engineering needs focus (49% placement rate)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                        <span>Increase core company participation for non-CS branches</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                        <span>Enhance internship-to-placement conversion rate</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Organize department-specific placement preparation workshops</p>
                    <p>• Increase collaboration with core industry companies</p>
                    <p>• Enhance soft skills and interview preparation training</p>
                    <p>• Focus on improving internship opportunities for all departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalPlaced}</div>
            <div className="text-sm text-gray-600">Total Placed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{overallStats.overallPercentage}%</div>
            <div className="text-sm text-gray-600">Overall Placement</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{overallStats.avgPackage} LPA</div>
            <div className="text-sm text-gray-600">Average Package</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{topCompanies.length}</div>
            <div className="text-sm text-gray-600">Recruiting Companies</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}