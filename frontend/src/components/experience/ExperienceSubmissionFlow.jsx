import React, { useState } from "react";
import { Progress } from "../ui/Progress";
import { Button } from "../ui/Button";
import { ArrowLeft } from "lucide-react";
import { CompanySelectionStep } from "./steps/CompanySelectionStep";
import { RoundsSelectionStep } from "./steps/RoundSelectionStep";
import { RoundDataStep } from "./steps/RoundDataStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SuccessStep } from "./steps/SuccessStep";
import api from "@/services/api";

export default function ExperienceSubmissionFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [experienceData, setExperienceData] = useState({
    // Step 1: Company & Role
    companyId: "",
    companyName: "",
    jobRole: "",
    status: "Pending",
    
    // Step 2: Rounds Selection
    selectedRounds: [],
    
    // Step 3: Round Details
    roundsData: {},
    
    // Step 4: Review & Overall
    overallRating: 0,
    experienceSummary: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Company & Role",
    "Interview Rounds",
    "Round Details",
    "Review & Submit",
    "Success",
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDataUpdate = (data) => {
    setExperienceData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmitExperience = async () => {
    try {
      setSubmitting(true);
      
      // Prepare final data structure
      const submissionData = {
        ...experienceData,
        // Ensure all required fields are present
        roundsData: experienceData.roundsData || {},
        overallRating: experienceData.overallRating || 0,
        experienceSummary: experienceData.experienceSummary || "",
      };
      
      const response = await api.post("/experiences", submissionData);
      
      if (response.data.success) {
        handleNext(); // Move to success step
      } else {
        alert("Failed to submit experience: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      alert("Failed to submit experience. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanySelectionStep
            data={experienceData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <RoundsSelectionStep
            data={experienceData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <RoundDataStep
            data={experienceData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={experienceData}
            onUpdate={handleDataUpdate}
            onNext={handleSubmitExperience}
            onBack={handleBack}
            submitting={submitting}
          />
        );
      case 5:
        return <SuccessStep data={experienceData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">
                Share Your Experience
              </h1>
              {currentStep > 1 && (
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-lg text-muted-foreground">
                {stepTitles[currentStep - 1]}
              </p>
            </div>
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
}