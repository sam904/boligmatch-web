// src/components/common/Stepper.tsx
import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export default function Stepper({ currentStep, steps, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-300 ${
                  index + 1 <= currentStep
                    ? index + 1 === currentStep
                      ? 'bg-green-500 border-green-500 text-white' // Current step - medium green
                      : 'bg-green-700 border-green-700 text-white' // Completed steps - dark green
                    : 'bg-white border-gray-300 text-gray-500' // Future steps
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium text-center transition-colors duration-300 ${
                  index + 1 <= currentStep 
                    ? index + 1 === currentStep
                      ? 'text-green-600' // Current step label - medium green
                      : 'text-green-800' // Completed steps label - dark green
                    : 'text-gray-500' // Future steps label
                }`}
              >
                {step}
              </span>
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 transition-colors duration-300 ${
                  index + 1 < currentStep 
                    ? 'bg-green-600' // Completed connector - medium green
                    : 'bg-gray-300' // Future connector
                }`}
                style={{ minWidth: '40px' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}