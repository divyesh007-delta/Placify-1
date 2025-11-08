import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import CompanyGrid from '../../components/dashboard/CompanyGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Filter, Building2, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CompaniesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    verifiedCompanies: 0,
    pendingVerification: 0
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchQuery, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies?limit=100'); // Get all companies
      const companiesData = response.data.companies || [];
      setCompanies(companiesData);
      
      // Calculate stats
      const verifiedCount = companiesData.filter(company => company.is_verified).length;
      const pendingCount = companiesData.filter(company => !company.is_verified).length;
      
      setStats({
        totalCompanies: companiesData.length,
        verifiedCompanies: verifiedCount,
        pendingVerification: pendingCount
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = companies.filter(company => 
      company.name?.toLowerCase().includes(query) ||
      company.location?.toLowerCase().includes(query) ||
      company.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      company.jobRoles?.some(role => role.title?.toLowerCase().includes(query))
    );
    setFilteredCompanies(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateCompany = () => {
    navigate('/sub-admin/create-company');
  };

  const handleExportData = () => {
    // Simple CSV export implementation
    const headers = ['Name', 'Location', 'Website', 'Employees', 'Founded', 'Verified', 'Experience Count'];
    const csvData = companies.map(company => [
      company.name,
      company.location,
      company.website,
      company.employees,
      company.founded,
      company.is_verified ? 'Yes' : 'No',
      company.experienceCount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'companies_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies Management</h1>
            <p className="text-gray-600 mt-2">
              Manage all registered companies in the placement portal
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              onClick={handleCreateCompany}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Company
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                All registered companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Companies</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Approved and active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Building2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingVerification}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Company Search</CardTitle>
            <CardDescription>
              Search and filter through all registered companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies by name, location, tags, or roles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
            
            {/* Search Results Info */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredCompanies.length} of {companies.length} companies
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Companies ({filteredCompanies.length})
            </h2>
          </div>
          
          {filteredCompanies.length > 0 ? (
            <CompanyGrid 
              companies={filteredCompanies}
              showActions={true}
              onCompanyUpdate={fetchCompanies} // Refresh data after actions
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No companies found
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchQuery 
                    ? `No companies match your search for "${searchQuery}". Try different keywords.`
                    : 'No companies have been registered yet.'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateCompany}>
                    Create First Company
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}