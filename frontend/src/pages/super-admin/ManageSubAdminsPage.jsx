// pages/super-admin/ManageSubAdminsPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Shield, Mail, Trash2, UserCheck, Clock } from 'lucide-react';
import api from '../../services/api';

export default function ManageSubAdminsPage() {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const response = await api.get('/super-admin/sub-admins');
      if (response.data.success) {
        setSubAdmins(response.data.sub_admins);
      }
    } catch (error) {
      console.error('Error fetching sub admins:', error);
      alert('Failed to fetch sub admins');
    } finally {
      setLoading(false);
    }
  };

  const removeSubAdmin = async (studentEmail) => {
    if (!window.confirm('Are you sure you want to remove this sub admin? They will lose all admin privileges.')) {
      return;
    }

    try {
      const response = await api.delete(`/super-admin/sub-admins/${studentEmail}`);
      if (response.data.success) {
        alert(response.data.message);
        fetchSubAdmins(); // Refresh the list
      }
    } catch (error) {
      console.error('Error removing sub admin:', error);
      alert(error.response?.data?.message || 'Failed to remove sub admin');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Sub Admins</h1>
            <p className="text-gray-600 mt-2">
              View and manage all sub admin accounts and permissions
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>{subAdmins.length} Active Sub Admins</span>
          </div>
        </div>

        {/* Sub Admins List */}
        <Card>
          <CardHeader>
            <CardTitle>Sub Administrators</CardTitle>
            <CardDescription>
              Students with administrative privileges for placement portal management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subAdmins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subAdmins.map((admin) => (
                    <TableRow key={admin.student_id}>
                      <TableCell className="font-medium">{admin.student_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>{admin.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {admin.department || (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {permission.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(admin.since)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {admin.created_by || 'System'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${admin.email}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSubAdmin(admin.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sub Admins</h3>
                <p className="text-gray-600 mb-4">
                  There are no sub administrators currently assigned.
                </p>
                <Button onClick={() => window.location.href = '/super-admin/students'}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Promote Students to Sub Admin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Sub Admin Permissions</CardTitle>
            <CardDescription>
              Overview of what sub administrators can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Create Companies</h4>
                  <p className="text-sm text-gray-600">Add new company profiles to the portal</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Verify Experiences</h4>
                  <p className="text-sm text-gray-600">Review and approve interview experiences</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Verify Profiles</h4>
                  <p className="text-sm text-gray-600">Approve student profile information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-gray-600">Access placement statistics and reports</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}