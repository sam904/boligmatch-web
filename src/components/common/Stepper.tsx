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
  completedSteps = [],
}: StepperProps) {
  const isCompleted = (step: number) => completedSteps.includes(step);
  const isClickable = (step: number) => {
    return isCompleted(step) || step <= currentStep || step === currentStep + 1;
  };

  const handleClick = (step: number) => {
    if (onStepClick && isClickable(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((label, idx) => {
          const step = idx + 1;
          const active = step === currentStep;
          const completed = isCompleted(step);
          const clickable = isClickable(step);

          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleClick(step)}
                  disabled={!clickable}
                  className={`
                    relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full
                    text-sm md:text-base font-semibold transition-all duration-200
                    ${active
                      ? 'bg-[#95C11F] text-white shadow-md scale-110'
                      : completed
                      ? 'bg-[#95C11F] text-white shadow-sm'
                      : 'bg-white border-2 border-gray-300 text-gray-600'
                    }
                    ${clickable
                      ? 'cursor-pointer hover:shadow-lg hover:scale-105'
                      : 'cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {completed ? (
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </button>

                {/* Label */}
                <span
                  className={`
                    mt-1.5 text-xs md:text-sm font-medium text-center
                    transition-colors duration-200 max-w-[80px] md:max-w-[100px]
                    ${active
                      ? 'text-[#95C11F] font-bold'
                      : completed
                      ? 'text-[#95C11F]'
                      : 'text-gray-500'
                    }
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Dotted Connector Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 md:h-1 transition-colors duration-200
                    ${step < currentStep || isCompleted(step + 1)
                      ? 'border-t-2 border-dashed border-[#95C11F]'
                      : 'border-t-2 border-dashed border-gray-300'
                    }
                  `}
                  style={{ minWidth: '32px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}