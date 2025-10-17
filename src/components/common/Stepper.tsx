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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  index + 1 <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium text-center ${
                  index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
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