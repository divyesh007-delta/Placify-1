// pages/sub-admin/CreateCompanyPage.jsx
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Building2, Plus, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    founded: '',
    employees: '',
    logo: '',
    tags: []
  });
  const [jobRoles, setJobRoles] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addJobRole = () => {
    setJobRoles(prev => [...prev, {
      title: '',
      avgPackage: '',
      positions: '',
      bondInfo: '',
      requirements: []
    }]);
  };

  const updateJobRole = (index, field, value) => {
    const updatedRoles = [...jobRoles];
    updatedRoles[index][field] = value;
    setJobRoles(updatedRoles);
  };

  const removeJobRole = (index) => {
    setJobRoles(prev => prev.filter((_, i) => i !== index));
  };

  const addRequirement = (roleIndex) => {
    const updatedRoles = [...jobRoles];
    if (!updatedRoles[roleIndex].requirements) {
      updatedRoles[roleIndex].requirements = [];
    }
    updatedRoles[roleIndex].requirements.push('');
    setJobRoles(updatedRoles);
  };

  const updateRequirement = (roleIndex, reqIndex, value) => {
    const updatedRoles = [...jobRoles];
    updatedRoles[roleIndex].requirements[reqIndex] = value;
    setJobRoles(updatedRoles);
  };

  const removeRequirement = (roleIndex, reqIndex) => {
    const updatedRoles = [...jobRoles];
    updatedRoles[roleIndex].requirements = updatedRoles[roleIndex].requirements.filter((_, i) => i !== reqIndex);
    setJobRoles(updatedRoles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const companyData = {
        ...formData,
        jobRoles: jobRoles.map(role => ({
          ...role,
          requirements: role.requirements || []
        }))
      };

      const response = await api.post('/sub-admin/companies', companyData);
      
      if (response.data.success) {
        alert('Company profile created successfully! Waiting for super admin verification.');
        // Reset form
        setFormData({
          name: '',
          description: '',
          location: '',
          website: '',
          founded: '',
          employees: '',
          logo: '',
          tags: []
        });
        setJobRoles([]);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert(error.response?.data?.message || 'Failed to create company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Company Profile</h1>
            <p className="text-gray-600 mt-2">
              Add new company information to the placement portal
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about the company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Google, Microsoft"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Bangalore, India"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website *</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the company, its mission, and culture..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year</Label>
                      <Input
                        id="founded"
                        value={formData.founded}
                        onChange={(e) => handleInputChange('founded', e.target.value)}
                        placeholder="e.g., 1998"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employees">Employee Count</Label>
                      <Input
                        id="employees"
                        value={formData.employees}
                        onChange={(e) => handleInputChange('employees', e.target.value)}
                        placeholder="e.g., 10,000+"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Job Roles</span>
                    <Button type="button" variant="outline" size="sm" onClick={addJobRole}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Role
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Add job roles and positions offered by the company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {jobRoles.map((role, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Role {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeJobRole(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            value={role.title}
                            onChange={(e) => updateJobRole(index, 'title', e.target.value)}
                            placeholder="e.g., Software Development Engineer"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Average Package (LPA) *</Label>
                          <Input
                            type="number"
                            value={role.avgPackage}
                            onChange={(e) => updateJobRole(index, 'avgPackage', e.target.value)}
                            placeholder="e.g., 18.5"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Positions Information</Label>
                        <Input
                          value={role.positions}
                          onChange={(e) => updateJobRole(index, 'positions', e.target.value)}
                          placeholder="e.g., 50 positions across India"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bond Information</Label>
                        <Input
                          value={role.bondInfo}
                          onChange={(e) => updateJobRole(index, 'bondInfo', e.target.value)}
                          placeholder="e.g., No bond, 1 year service agreement"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Requirements</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addRequirement(index)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Requirement
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(role.requirements || []).map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-center space-x-2">
                              <Input
                                value={req}
                                onChange={(e) => updateRequirement(index, reqIndex, e.target.value)}
                                placeholder="e.g., Minimum 7.5 CGPA"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRequirement(index, reqIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {jobRoles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No job roles added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags & Categories</CardTitle>
                  <CardDescription>
                    Add relevant tags for better searchability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Add Tag</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="e.g., IT, Product, Startup"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>
                    Upload company logo image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload company logo</p>
                      <Input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => handleInputChange('logo', e.target.value)}
                        placeholder="Logo URL"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="p-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Creating Company...' : 'Create Company Profile'}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Company will be visible after super admin verification
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}