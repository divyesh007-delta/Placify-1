import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { TrendingUp, TrendingDown, Minus, Loader2, Target, Lightbulb, BarChart3, Users } from "lucide-react";
import api from "../../services/api";

export function CompanyInsights({ companyId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyInsights();
  }, [companyId]);

  const fetchCompanyInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}/insights`);
      
      if (response.data.success) {
        setInsights(response.data.insights);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching company insights:", error);
      setError("Failed to load company insights");
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setLoading(true);
      // Use the quick endpoint for real-time data
      const response = await api.get(`/companies/${companyId}/insights/quick`);
      
      if (response.data.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error("Error refreshing insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Safe data access functions
  const getOverallStats = () => {
    return insights?.overallStats || {
      totalExperiences: 0,
      successRate: 0,
      averageRating: 0,
      selectedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      topJobRoles: {}
    };
  };

  const getRoundsAnalysis = () => {
    return insights?.roundsAnalysis || {};
  };

  const getTopQuestions = () => {
    return insights?.topQuestions || {};
  };

  const getPreparationTips = () => {
    return insights?.preparationTips || [];
  };

  const getSuccessPatterns = () => {
    return insights?.successPatterns || {};
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Generating insights...</span>
        </CardContent>
      </Card>
    );
  }

    if (error || !insights) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-500">Error: {error || "No insights data available"}</p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={fetchCompanyInsights}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Retry
            </button>
            <button 
              onClick={refreshInsights}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Generate Fresh Insights
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }


  const overallStats = getOverallStats();
  const roundsAnalysis = getRoundsAnalysis();
  const topQuestions = getTopQuestions();
  const preparationTips = getPreparationTips();
  const successPatterns = getSuccessPatterns();

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Interview Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{overallStats.totalExperiences || 0}</div>
              <div className="text-sm text-muted-foreground">Total Experiences</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{overallStats.successRate || 0}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{overallStats.averageRating || 0}/5</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{overallStats.selectedCount || 0}</div>
              <div className="text-sm text-muted-foreground">Selected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rounds Analysis */}
      {Object.keys(roundsAnalysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Rounds Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roundsAnalysis).map(([roundName, data]) => (
                <div key={roundName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize">{roundName} Round</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{data.percentage || 0}% frequency</Badge>
                      <Badge className={getDifficultyColor(data.difficulty || "Unknown")}>
                        {data.difficulty || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Appears in {data.frequency || 0} interviews</span>
                      <span>{data.percentage || 0}% of cases</span>
                    </div>
                    <Progress value={data.percentage || 0} className="h-2" />
                    
                    {data.commonTopics && data.commonTopics.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Common topics: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.commonTopics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic.topic} ({topic.frequency})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Questions */}
      {Object.keys(topQuestions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(topQuestions).map(([roundType, questions]) => (
                <div key={roundType}>
                  <h4 className="font-semibold mb-3 capitalize">{roundType} Questions</h4>
                  <div className="space-y-3">
                    {questions.slice(0, 3).map((q, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium flex-1">
                            {q.representativeQuestion || q.question || "No question text"}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {q.frequency || 0} mentions
                          </Badge>
                        </div>
                        {q.similarQuestions && q.similarQuestions.length > 1 && (
                          <p className="text-sm text-muted-foreground">
                            Similar variations reported
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparation Tips */}
      {preparationTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Preparation Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {preparationTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Success Patterns */}
      {successPatterns && successPatterns.successfulCandidates > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Success Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Successful candidates:</span>
                  <div className="font-semibold">{successPatterns.successfulCandidates}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg rating (successful):</span>
                  <div className="font-semibold">{successPatterns.averageRatingSuccessful || 0}/5</div>
                </div>
              </div>
              
              {successPatterns.keyDifferentiators && successPatterns.keyDifferentiators.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Differentiators:</h4>
                  <ul className="space-y-1">
                    {successPatterns.keyDifferentiators.map((diff, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback message if no insights data */}
      {!insights.overallStats && Object.keys(roundsAnalysis).length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No insights available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Insights will be generated as more interview experiences are shared.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}