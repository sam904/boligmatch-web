// src/components/common/Stepper.tsx
import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export default function Stepper({ 
  currentStep, 
  steps, 
  className = '', 
  onStepClick,
  completedSteps = []
}: StepperProps) {
  const isStepCompleted = (step: number) => completedSteps.includes(step);
  const isStepClickable = (step: number) => {
    // Allow clicking on completed steps, current step, or next immediate step
    return isStepCompleted(step) || step <= currentStep || step === currentStep + 1;
  };

  const handleStepClick = (step: number) => {
    if (onStepClick && isStepClickable(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = isStepCompleted(stepNumber);
          const isClickable = isStepClickable(stepNumber);

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 
                    transition-all duration-300 transform
                    ${isActive
                      ? 'bg-green-500 border-green-500 text-white scale-110 shadow-lg' // Current step - medium green
                      : isCompleted
                      ? 'bg-green-700 border-green-700 text-white shadow-md' // Completed steps - dark green
                      : 'bg-white border-gray-300 text-gray-500' // Future steps
                    }
                    ${isClickable 
                      ? 'cursor-pointer hover:shadow-lg hover:scale-105' 
                      : 'cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </button>
                <span
                  className={`
                    text-xs mt-2 font-medium text-center transition-colors duration-300 max-w-24
                    ${isActive
                      ? 'text-green-600 font-bold' // Current step label - medium green
                      : isCompleted
                      ? 'text-green-800' // Completed steps label - dark green
                      : 'text-gray-500' // Future steps label
                    }
                  `}
                >
                  {step}
                </span>
              </div>
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 transition-colors duration-300
                    ${stepNumber < currentStep || isStepCompleted(stepNumber + 1)
                      ? 'bg-green-600' // Completed connector - medium green
                      : 'bg-gray-300' // Future connector
                    }
                  `}
                  style={{ minWidth: '40px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}