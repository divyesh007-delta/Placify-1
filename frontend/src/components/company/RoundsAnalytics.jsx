import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  Loader2, TrendingUp, Users, Target, Clock, BarChart3, Activity, 
  PieChart as PieChartIcon, LineChart as LineChartIcon, 
  BarChartHorizontal, Cloud, Thermometer, Star, Hash, Calendar,
  MessageSquare, BookOpen, Users as UsersIcon
} from "lucide-react";
import api from "../../services/api";

// Enhanced color constants
const CHART_COLORS = {
  aptitude: "#0891b2",
  coding: "#d97706", 
  technical: "#059669",
  hr: "#7c3aed",
  selected: "#10b981",
  rejected: "#ef4444",
  pending: "#f59e0b",
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444"
};

export function RoundsAnalytics({ companyId }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchRoundsAnalytics();
  }, [companyId]);

  const fetchRoundsAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}/rounds-analytics`);
      
      if (response.data.success) {
        setAnalyticsData(response.data.roundsAnalytics);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching rounds analytics:", error);
      setError("Failed to load rounds analytics");
    } finally {
      setLoading(false);
    }
  };

  // Prepare all chart data from backend
  const prepareChartData = () => {
    if (!analyticsData?.chartData) {
      return {
        // Basic charts
        passRateData: [],
        difficultyData: [],
        roundsDistribution: [],
        timelineData: [],
        statusDistribution: [],
        wordFrequency: [],
        
        // Comprehensive charts
        difficultyDistribution: [],
        companyDifficulty: [],
        questionsPerSection: [],
        roundDifficultyDistribution: [],
        feedbackWordFrequency: [],
        reviewSentiment: [],
        roundsPerCompany: [],
        questionTypesCount: [],
        difficultyHeatmap: [],
        mostAskedTopics: [],
        timelineByStatus: [],
        successRateByJobRole: []
      };
    }

    const { chartData } = analyticsData;

    // Process all chart data
    return {
      // Basic charts
      passRateData: chartData.successRateByRound?.map(item => ({
        name: item.round,
        successRate: item.successRate,
        totalExperiences: item.totalExperiences,
        successCount: item.successCount,
        fill: CHART_COLORS[item.round.toLowerCase()] || "#6b7280"
      })) || [],

      difficultyData: chartData.difficultyByRound?.map(item => ({
        round: item.round,
        difficulty: item.difficultyScore * 3, // Scale for better visualization
        difficultyLevel: item.difficultyLevel,
        dataCount: item.dataCount,
        fill: getDifficultyColor(item.difficultyLevel)
      })) || [],

      roundsDistribution: chartData.roundsDistribution || [],
      timelineData: chartData.timelineData || [],
      statusDistribution: chartData.statusDistribution || [],
      wordFrequency: chartData.wordFrequency || [],

      // New comprehensive charts
      difficultyDistribution: chartData.difficultyDistribution || [],
      companyDifficulty: chartData.companyDifficulty || [],
      questionsPerSection: chartData.questionsPerSection || [],
      roundDifficultyDistribution: chartData.roundDifficultyDistribution || [],
      feedbackWordFrequency: chartData.feedbackWordFrequency || [],
      reviewSentiment: chartData.reviewSentiment || [],
      roundsPerCompany: chartData.roundsPerCompany || [],
      questionTypesCount: chartData.questionTypesCount || [],
      difficultyHeatmap: chartData.difficultyHeatmap || [],
      mostAskedTopics: chartData.mostAskedTopics || [],
      timelineByStatus: chartData.timelineByStatus || [],
      successRateByJobRole: chartData.successRateByJobRole || []
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "#10b981";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "#6b7280";
    }
  };

  // Enhanced custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}{entry.dataKey === 'successRate' ? '%' : ''}</strong>
              {entry.payload?.totalExperiences && (
                <span className="text-xs block text-gray-500">
                  ({entry.payload.successCount}/{entry.payload.totalExperiences} successful)
                </span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">
            Count: <strong>{payload[0].value}</strong>
          </p>
          {payload[0].payload?.count && (
            <p className="text-sm">
              Experiences: <strong>{payload[0].payload.count}</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const {
    // Basic charts
    passRateData,
    difficultyData,
    roundsDistribution,
    timelineData,
    statusDistribution,
    wordFrequency,
    
    // Comprehensive charts
    difficultyDistribution,
    companyDifficulty,
    questionsPerSection,
    roundDifficultyDistribution,
    feedbackWordFrequency,
    reviewSentiment,
    roundsPerCompany,
    questionTypesCount,
    difficultyHeatmap,
    mostAskedTopics,
    timelineByStatus,
    successRateByJobRole
  } = prepareChartData();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Generating comprehensive analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-500">Error: {error || "No analytics data available"}</p>
          <button 
            onClick={fetchRoundsAnalytics}
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Retry Analysis
          </button>
        </CardContent>
      </Card>
    );
  }

  const { roundsAnalytics, summary } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{summary.totalExperiences}</div>
                  <div className="text-sm text-muted-foreground">Total Experiences</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{summary.successRate?.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{summary.averageRoundsPerInterview}</div>
                  <div className="text-sm text-muted-foreground">Avg Rounds</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-lg font-bold">
                    {summary.mostCommonRounds?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Common Rounds</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comprehensive Interview Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="rounds" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Rounds Analysis
              </TabsTrigger>
              <TabsTrigger value="difficulty" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Difficulty
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                Trends & Topics
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Success Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Success Rates by Round
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {passRateData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={passRateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={CustomTooltip} />
                          <Bar dataKey="successRate" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No success rate data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Difficulty Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Difficulty Levels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {difficultyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={difficultyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="round" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip content={CustomTooltip} />
                          <Bar dataKey="difficulty" fill="#0891b2" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No difficulty data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              {statusDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.status.toLowerCase()] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip content={PieTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Status Breakdown</h4>
                        {statusDistribution.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <Badge variant="outline">{item.status}</Badge>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline Overview */}
              {timelineData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Experiences Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={CustomTooltip} />
                        <Line type="monotone" dataKey="experiences" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ROUNDS ANALYSIS TAB */}
            <TabsContent value="rounds" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rounds Distribution */}
                {roundsDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rounds Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={roundsDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {roundsDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[entry.name.toLowerCase()] || "#6b7280"} 
                              />
                            ))}
                          </Pie>
                          <Tooltip content={PieTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Questions per Section */}
                {questionsPerSection.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questions per Section</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={questionsPerSection}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="section" />
                          <YAxis />
                          <Tooltip content={CustomTooltip} />
                          <Bar dataKey="questionCount" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Question Types Count */}
              {questionTypesCount.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={questionTypesCount}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Rounds per Company */}
              {roundsPerCompany.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rounds per Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={roundsPerCompany} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="company" width={100} />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="roundCount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* DIFFICULTY TAB */}
            <TabsContent value="difficulty" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Distribution */}
                {difficultyDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Difficulty Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={difficultyDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {difficultyDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name.toLowerCase()] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip content={PieTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Round Difficulty Distribution */}
                {roundDifficultyDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Round Difficulty Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={roundDifficultyDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {roundDifficultyDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name.toLowerCase()] || "#6b7280"} />
                            ))}
                          </Pie>
                          <Tooltip content={PieTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Review Sentiment */}
              {reviewSentiment.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review Sentiment by Round</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reviewSentiment}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="avgSentiment" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Company Difficulty Comparison */}
              {companyDifficulty.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Difficulty by Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={companyDifficulty} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis type="category" dataKey="company" width={100} />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="avgDifficulty" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TRENDS & TOPICS TAB */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline by Status */}
                {timelineByStatus.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Experiences Timeline by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineByStatus}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={CustomTooltip} />
                          <Legend />
                          <Line type="monotone" dataKey="selected" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Most Asked Topics */}
                {mostAskedTopics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Most Asked Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mostAskedTopics} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="topic" width={100} />
                          <Tooltip content={CustomTooltip} />
                          <Bar dataKey="frequency" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Word Frequency */}
              {feedbackWordFrequency.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Common Feedback Words</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={feedbackWordFrequency}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="word" />
                        <YAxis />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="frequency" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Success Rate by Job Role */}
              {successRateByJobRole.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Success Rate by Job Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={successRateByJobRole} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="jobRole" width={120} />
                        <Tooltip content={CustomTooltip} />
                        <Bar dataKey="successRate" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Difficulty Heatmap */}
              {difficultyHeatmap.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company vs Difficulty Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Company</th>
                            <th className="text-center p-2">Easy</th>
                            <th className="text-center p-2">Medium</th>
                            <th className="text-center p-2">Hard</th>
                          </tr>
                        </thead>
                        <tbody>
                          {difficultyHeatmap.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{item.company}</td>
                              <td className="text-center p-2">
                                <Badge variant={item.difficulty === "Easy" ? "default" : "outline"}>
                                  {item.difficulty === "Easy" ? item.count : "-"}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={item.difficulty === "Medium" ? "default" : "outline"}>
                                  {item.difficulty === "Medium" ? item.count : "-"}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={item.difficulty === "Hard" ? "default" : "outline"}>
                                  {item.difficulty === "Hard" ? item.count : "-"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}