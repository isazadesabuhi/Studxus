// components/StepIndicator.tsx
import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-center items-center gap-2 mb-4">
      {steps.map((step, index) => {
        const isActive = index + 1 <= currentStep;
        return (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              isActive
                ? "bg-alternative border-alternative text-white"
                : "border-gray-300 text-gray-400"
            }`}
          >
            {index + 1}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
