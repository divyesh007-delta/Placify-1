import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CompanyHeader } from "../../components/company/CompanyHeader";
import { CompanyOverview } from "../../components/company/CompanyOverview";
import { RoundsAnalytics } from "../../components/company/RoundsAnalytics";
import { PlacedStudents } from "../../components/company/PlacedStudents";
import { CompanyInsights } from "../../components/company/CompanyInsights";
import { BackButton } from "../../components/ui/BackButton";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      console.error("❌ Company ID is undefined!");
      setError("Company ID is missing from the URL");
      setLoading(false);
      return;
    }
    
    console.log("✅ Company ID found:", id);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading company page...</p>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>
              {error || "Company not found. Please check the URL and try again."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        {/* Render components */}
        <div className="space-y-8">
          <section>
            <CompanyHeader companyId={id} />
          </section>

          <section>
            <CompanyOverview companyId={id} />
          </section>

          <section>
            <RoundsAnalytics companyId={id} />
          </section>

          <section>
            <CompanyInsights companyId={id} />
          </section>

          <section>
            <PlacedStudents companyId={id} />
          </section>
        </div>
      </div>
    </div>
  );
}