import React, { useState, useEffect } from "react";
import { CompanyCard } from "./CompanyCard";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export function CompanyGrid() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/companies");
      
      if (response.data.success) {
        setCompanies(response.data.companies);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (companyId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated with return url
      navigate('/login', { state: { from: `/company/${companyId}` } });
      return;
    }
    // Navigate to company details for authenticated users
    navigate(`/company/${companyId}`);
  };

  // Wrap each company card with a click handler
  const CompanyCardWrapper = ({ company }) => (
    <div 
      className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      onClick={() => handleCompanyClick(company.id)}
    >
      <CompanyCard company={company} />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Companies</h2>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading companies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Companies</h2>
          <p className="text-muted-foreground">0 companies found</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchCompanies}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Companies</h2>
        <p className="text-muted-foreground">{companies.length} companies found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCardWrapper key={company.id} company={company} />
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No companies found. Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}

export default CompanyGrid;