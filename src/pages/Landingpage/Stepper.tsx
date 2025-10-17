import React, { useState } from "react";
import icon1 from "../../assets/userImages/01.png";
import icon2 from "../../assets/userImages/02.png";
import icon3 from "../../assets/userImages/03.png";
import icon4 from "../../assets/userImages/04.png";
import icon5 from "../../assets/userImages/05.png";
import icon6 from "../../assets/userImages/06.png";
import icon7 from "../../assets/userImages/07.png";
import icon8 from "../../assets/userImages/08.png";
import circlebg from "../../assets/userImages/circle-bg.png";
import stepperBg from "../../assets/userImages/stepper-bg.png";
import jurneyImg from "/src/assets/userImages/jurneyImg.png";

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { number: "01", icon: icon1, label: "Fysisk vurdering og dokumentation" },
    { number: "02", icon: icon2, label: "Fotografering og beskrivelse" },
    {
      number: "03",
      icon: icon3,
      label: "Til salg, åbent hus og fremvisninger",
    },
    { number: "04", icon: icon4, label: "Bud og forhandling" },
    { number: "05", icon: icon5, label: "Underskrift af køber og sælger" },
    { number: "06", icon: icon6, label: "Godkendelse af bank og rådgiver" },
    { number: "07", icon: icon7, label: "Endelig handel og tinglysning" },
    { number: "08", icon: icon8, label: "Overdragelse og opfølgning" },
  ];

  return (
    <div
      className="flex items-center justify-center w-full h-[100vh] mx-auto p-14"
      style={{
        backgroundImage: `url(${stepperBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex items-start w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className="flex flex-col items-center flex-1 min-w-0 z-10 relative"
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* ✅ Tick mark (kept from your logic) */}
              {currentStep >= index + 1 && (
                <div className="absolute -top-3 -right-0.5 z-20">
                  <div className="rounded-full p-1 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Step Button */}
              <div className="relative flex items-center justify-center">
                {/* Background circle image */}
                <img
                  src={circlebg}
                  alt=""
                  className={`transition-opacity duration-200 ${
                    hoveredStep === index ? "opacity-100" : "opacity-0"
                  }`}
                />
                {/* Overlapping button centered on the image */}
                <button
                  onClick={() => onStepClick?.(index + 1)}
                  className={`absolute flex items-center justify-center w-[70px] h-[70px] rounded-full transition-all duration-200 ${
                    currentStep >= index + 1
                      ? "bg-[#043428] text-white"
                      : "bg-[#043428] text-gray-500"
                  } ${
                    onStepClick
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-default"
                  }`}
                >
                  <img src={step.icon} alt="" className="w-9" />
                </button>
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-sm font-medium text-center max-w-[120px] ${
                  currentStep >= index + 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>

              {hoveredStep === index && (
                <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 w-[150px] bg-[#043428] text-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 z-50">
                  <div className="relative">
                    <img
                      src={jurneyImg}
                      alt="step visual"
                      className="w-full h-[150px] object-cover"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-3xl font-bold">{step.number}</h3>
                    <h4 className="text-lg font-semibold mt-1">{step.label}</h4>
                    <p className="text-sm mt-3 text-gray-200">
                      Atia quaspeiles aut eos eici maximi molles quae
                      venesistatis mo tenimet, autemet expliaturr restibero et
                      volore rem velit.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mt-11 relative min-w-[20px] max-w-[120px] border-t-2 border-dotted border-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
