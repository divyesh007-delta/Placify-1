// pages/sub-admin/VerifyProfilesPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { CheckCircle, XCircle, Eye, User, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function VerifyProfilesPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, you'd fetch from API
    setStudents([
      {
        student_id: '22cp059',
        name: 'John Doe',
        email: '22cp059@bvmengineering.ac.in',
        department: 'Computer Engineering',
        semester: 6,
        cgpa: 8.5,
        phone: '9876543210',
        skills: ['React', 'Node.js', 'Python', 'MongoDB'],
        updated_at: new Date().toISOString()
      },
      {
        student_id: '22it045',
        name: 'Jane Smith',
        email: '22it045@bvmengineering.ac.in',
        department: 'Information Technology',
        semester: 6,
        cgpa: 8.2,
        phone: '9876543211',
        skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'],
        updated_at: new Date().toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const verifyProfile = async (studentId, approved) => {
    try {
      // In real app, you'd call API to verify profile
      if (approved) {
        alert(`Profile ${studentId} verified successfully!`);
        // Remove from pending list
        setStudents(prev => prev.filter(student => student.student_id !== studentId));
        setSelectedStudent(null);
      } else {
        alert('Rejection feature to be implemented');
      }
    } catch (error) {
      console.error('Error verifying profile:', error);
      alert('Failed to verify profile');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            <h1 className="text-3xl font-bold text-gray-900">Verify Student Profiles</h1>
            <p className="text-gray-600 mt-2">
              Review and verify student profile information
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-5 w-5 text-blue-600" />
            <span>{students.length} Profiles Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pending Profiles</CardTitle>
                <CardDescription>
                  Student profiles waiting for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <Card 
                      key={student.student_id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedStudent?.student_id === student.student_id 
                          ? 'border-blue-500 border-2' 
                          : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.student_id}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{student.department}</Badge>
                              <Badge variant="secondary">Sem {student.semester}</Badge>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Updated {formatDate(student.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {students.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <p>No pending profiles!</p>
                      <p className="text-sm">All profiles are verified.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Review Profile</span>
                    <Badge variant="secondary">Pending Verification</Badge>
                  </CardTitle>
                  <CardDescription>
                    Verify this student's profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-lg">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Student ID</label>
                        <p className="text-lg font-mono">{selectedStudent.student_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-lg">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-lg">{selectedStudent.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <p className="text-lg">{selectedStudent.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Semester</label>
                        <p className="text-lg">Semester {selectedStudent.semester}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">CGPA</label>
                        <p className="text-lg">{selectedStudent.cgpa}/10.0</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Skills & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.skills.map((skill, index) => (
                        <Badge key={index} variant="default">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Academic Information - Mock data */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="font-medium">SSC Percentage</label>
                          <p>92%</p>
                        </div>
                        <div>
                          <label className="font-medium">HSC Percentage</label>
                          <p>88%</p>
                        </div>
                        <div>
                          <label className="font-medium">Diploma Percentage</label>
                          <p>N/A</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects - Mock data */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Projects</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">Placement Portal</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Full-stack web application for college placement management
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Tech: React, Node.js, MongoDB</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">E-Commerce App</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Mobile application for online shopping
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Tech: Flutter, Firebase</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => verifyProfile(selectedStudent.student_id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Profile
                    </Button>
                    <Button
                      onClick={() => verifyProfile(selectedStudent.student_id, false)}
                      variant="outline"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Profile</h3>
                  <p className="text-gray-600">
                    Choose a student profile from the list to review and verify it.
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