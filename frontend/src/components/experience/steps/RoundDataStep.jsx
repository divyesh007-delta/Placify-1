import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CodingForm from "../forms/CodingForm";
import { TechnicalForm } from "../forms/TechnicalForm";
import { HRForm } from "../forms/HRForm";
import { GDForm } from "../forms/GDForm";
import AptitudeForm from "../forms/AptitudeForm";

export function RoundDataStep({ data, onUpdate, onNext, onBack }) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const handleRoundDataUpdate = (roundName, roundData) => {
    const updatedRoundsData = {
      ...data.roundsData,
      [roundName]: roundData
    };
    onUpdate({ roundsData: updatedRoundsData });
  };

  const handleNextRound = () => {
    if (currentRoundIndex < data.selectedRounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // All rounds completed, proceed to review
      onNext();
    }
  };

  const handlePreviousRound = () => {
    if (currentRoundIndex > 0) {
      setCurrentRoundIndex(prev => prev - 1);
    } else {
      // Go back to round selection
      onBack();
    }
  };

  const renderCurrentRoundForm = () => {
    const currentRoundName = data.selectedRounds[currentRoundIndex];
    const roundData = data.roundsData[currentRoundName] || {};
    
    const formProps = {
      data: roundData,
      onUpdate: (updatedData) => handleRoundDataUpdate(currentRoundName, updatedData)
    };

    switch (currentRoundName) {
      case "coding":
        return <CodingForm {...formProps} />;
      case "technical":
        return <TechnicalForm {...formProps} />;
      case "hr":
        return <HRForm {...formProps} />;
      case "gd":
        return <GDForm {...formProps} />;
      case "aptitude":
        return <AptitudeForm {...formProps} />;
      default:
        return <div>Form for {currentRoundName} not implemented</div>;
    }
  };

  const canProceedToNext = () => {
    const currentRoundName = data.selectedRounds[currentRoundIndex];
    const currentRoundData = data.roundsData[currentRoundName];
    
    // Check if current round has at least some data
    return currentRoundData && Object.keys(currentRoundData).length > 0;
  };

  const getRoundDisplayName = (roundId) => {
    const roundNames = {
      "aptitude": "Aptitude Test",
      "coding": "Coding Round", 
      "technical": "Technical Interview",
      "gd": "Group Discussion",
      "hr": "HR Interview"
    };
    return roundNames[roundId] || roundId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide detailed information for each selected round ({currentRoundIndex + 1} of {data.selectedRounds.length})
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-4">
          {data.selectedRounds.map((round, index) => (
            <div key={round} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index === currentRoundIndex 
                    ? "bg-primary text-primary-foreground" 
                    : index < currentRoundIndex 
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < data.selectedRounds.length - 1 && (
                <div 
                  className={`w-8 h-1 ${
                    index < currentRoundIndex ? "bg-green-500" : "bg-muted"
                  }`} 
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Current round name */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            {getRoundDisplayName(data.selectedRounds[currentRoundIndex])}
          </h3>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Current form */}
        <div className="space-y-6">
          {renderCurrentRoundForm()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePreviousRound}>
            {currentRoundIndex === 0 ? "Back to Rounds" : "Previous Round"}
          </Button>
          
          <Button 
            onClick={handleNextRound} 
            disabled={!canProceedToNext()}
          >
            {currentRoundIndex < data.selectedRounds.length - 1 
              ? `Continue to ${getRoundDisplayName(data.selectedRounds[currentRoundIndex + 1])}`
              : "Continue to Review"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}