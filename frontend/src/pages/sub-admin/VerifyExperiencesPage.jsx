// pages/sub-admin/VerifyExperiencesPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, Star, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function VerifyExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchPendingExperiences();
  }, []);

  const fetchPendingExperiences = async () => {
    try {
      const response = await api.get('/sub-admin/experiences/pending');
      if (response.data.success) {
        setExperiences(response.data.experiences);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      alert('Failed to fetch pending experiences');
    } finally {
      setLoading(false);
    }
  };

  const verifyExperience = async (experienceId) => {
    setVerifying(true);
    try {
      const response = await api.post(`/sub-admin/experiences/${experienceId}/verify`);
      if (response.data.success) {
        alert('Experience verified successfully!');
        // Remove from pending list
        setExperiences(prev => prev.filter(exp => exp.experience_id !== experienceId));
        setSelectedExperience(null);
        setVerificationNote('');
      }
    } catch (error) {
      console.error('Error verifying experience:', error);
      alert(error.response?.data?.message || 'Failed to verify experience');
    } finally {
      setVerifying(false);
    }
  };

  const rejectExperience = async (experienceId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setRejecting(true);
    try {
      const response = await api.post(`/sub-admin/experiences/${experienceId}/reject`, {
        rejection_reason: rejectionReason
      });
      if (response.data.success) {
        alert('Experience rejected successfully!');
        // Remove from pending list
        setExperiences(prev => prev.filter(exp => exp.experience_id !== experienceId));
        setSelectedExperience(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting experience:', error);
      alert(error.response?.data?.message || 'Failed to reject experience');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRoundDetails = (roundsData, selectedRounds) => {
    return selectedRounds.map((round) => {
      const roundData = roundsData[round] || {};
      
      return (
        <div key={round} className="p-4 bg-gray-50 rounded-lg mb-4">
          <h4 className="font-medium text-lg capitalize mb-3">{round} Round</h4>
          
          {round === 'aptitude' && roundData && (
            <div className="space-y-2">
              <p><strong>Attempted:</strong> {roundData.attemptedQ} questions</p>
              <p><strong>Correct:</strong> {roundData.correctQ} questions</p>
              <p><strong>Difficulty:</strong> {roundData.difficulty}</p>
              <p><strong>Feedback:</strong> {roundData.feedback}</p>
              {roundData.sampleQuestions && roundData.sampleQuestions.length > 0 && (
                <div>
                  <strong>Sample Questions:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {roundData.sampleQuestions.map((q, idx) => (
                      <li key={idx}>{q.question} - Answer: {q.answer}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {round === 'coding' && roundData && (
            <div className="space-y-2">
              <p><strong>Difficulty:</strong> {roundData.difficulty}</p>
              <p><strong>Time Limit:</strong> {roundData.timeLimit}</p>
              <p><strong>Languages Used:</strong> {roundData.languagesUsed?.join(', ')}</p>
              <p><strong>Feedback:</strong> {roundData.feedback}</p>
              {roundData.top3Questions && roundData.top3Questions.length > 0 && (
                <div>
                  <strong>Top Questions:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {roundData.top3Questions.map((q, idx) => (
                      <li key={idx}>{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {round === 'technical' && roundData && (
            <div className="space-y-2">
              <p><strong>Difficulty:</strong> {roundData.difficulty}</p>
              <p><strong>Duration:</strong> {roundData.duration}</p>
              <p><strong>Focus Topics:</strong> {roundData.focusTopics?.join(', ')}</p>
              <p><strong>Feedback:</strong> {roundData.feedback}</p>
              {roundData.top5Questions && roundData.top5Questions.length > 0 && (
                <div>
                  <strong>Top Questions:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {roundData.top5Questions.map((q, idx) => (
                      <li key={idx}>{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {round === 'hr' && roundData && (
            <div className="space-y-2">
              <p><strong>Duration:</strong> {roundData.duration}</p>
              <p><strong>Rating:</strong> {roundData.rating}/5</p>
              <p><strong>Feedback:</strong> {roundData.feedback}</p>
              {roundData.topQuestions && roundData.topQuestions.length > 0 && (
                <div>
                  <strong>Questions Asked:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {roundData.topQuestions.map((q, idx) => (
                      <li key={idx}>{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verify Experiences</h1>
            <p className="text-gray-600 mt-2">
              Review and verify interview experiences submitted by students
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>{experiences.length} Pending Verification</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Experiences List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pending Experiences</CardTitle>
                <CardDescription>
                  Experiences waiting for your review (isVerified: false)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <Card 
                      key={experience.experience_id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedExperience?.experience_id === experience.experience_id 
                          ? 'border-blue-500 border-2' 
                          : ''
                      }`}
                      onClick={() => setSelectedExperience(experience)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold">{experience.company_name}</h3>
                            <p className="text-sm text-gray-600">{experience.job_role}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{experience.user_id}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-gray-500">
                                  {experience.overall_rating}/5
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatDate(experience.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {experience.selected_rounds?.map(round => (
                                <Badge key={round} variant="outline" className="text-xs capitalize">
                                  {round}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {experiences.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <p>No pending experiences!</p>
                      <p className="text-sm">All experiences are verified.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experience Details */}
          <div className="lg:col-span-2">
            {selectedExperience ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Review Experience</span>
                    <Badge variant="secondary">Pending Verification</Badge>
                  </CardTitle>
                  <CardDescription>
                    Verify this interview experience before making it public
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company</label>
                      <p className="text-lg font-semibold">{selectedExperience.company_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Job Role</label>
                      <p className="text-lg font-semibold">{selectedExperience.job_role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Student ID</label>
                      <p className="text-lg font-semibold">{selectedExperience.user_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Overall Rating</label>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-lg font-semibold">{selectedExperience.overall_rating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Summary */}
                  {selectedExperience.experience_summary && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience Summary</label>
                      <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-lg">
                        {selectedExperience.experience_summary}
                      </p>
                    </div>
                  )}

                  {/* Interview Rounds */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Interview Rounds</label>
                    <div className="mt-2 space-y-2">
                      {renderRoundDetails(selectedExperience.rounds_data, selectedExperience.selected_rounds)}
                    </div>
                  </div>

                  {/* Verification Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Notes</label>
                    <Textarea
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder="Add any notes about this verification (optional)"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rejection Reason (Required for rejection)</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejecting this experience..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => verifyExperience(selectedExperience.experience_id)}
                      disabled={verifying}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {verifying ? 'Verifying...' : 'Approve & Verify'}
                    </Button>
                    <Button
                      onClick={() => rejectExperience(selectedExperience.experience_id)}
                      disabled={rejecting || !rejectionReason.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {rejecting ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Experience</h3>
                  <p className="text-gray-600">
                    Choose an experience from the list to review and verify it.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}