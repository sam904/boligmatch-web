import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import icon1 from "../../assets/userImages/01.png";
import icon2 from "../../assets/userImages/02.png";
import icon3 from "../../assets/userImages/03.png";
import icon4 from "../../assets/userImages/04.png";
import icon5 from "../../assets/userImages/05.png";
import icon6 from "../../assets/userImages/06.png";
import icon7 from "../../assets/userImages/07.png";
import icon8 from "../../assets/userImages/08.png";
import circlebg from "../../assets/userImages/circle-bg.png";
import stepperBg from "/src/assets/userImages/stepper.jpeg";
import jurneyImg from "/src/assets/userImages/jurneyImg.png";
import steperBgMobile from "/src/assets/userImages/steper-mobile.png";

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  const { t } = useTranslation();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const steps = [
    {
      number: "01",
      icon: icon1,
      label: t("stepper.physical.label"),
      description: t("stepper.physical.description"),
    },
    {
      number: "02",
      icon: icon2,
      label: t("stepper.photography.label"),
      description: t("stepper.photography.description"),
    },
    {
      number: "03",
      icon: icon3,
      label: t("stepper.viewing.label"),
      description: t("stepper.viewing.description"),
    },
    {
      number: "04",
      icon: icon4,
      label: t("stepper.negotiation.label"),
      description: t("stepper.negotiation.description"),
    },
    {
      number: "05",
      icon: icon5,
      label: t("stepper.signing.label"),
      description: t("stepper.signing.description"),
    },
    {
      number: "06",
      icon: icon6,
      label: t("stepper.approval.label"),
      description: t("stepper.approval.description"),
    },
    {
      number: "07",
      icon: icon7,
      label: t("stepper.final.label"),
      description: t("stepper.final.description"),
    },
    {
      number: "08",
      icon: icon8,
      label: t("stepper.transfer.label"),
      description: t("stepper.transfer.description"),
    },
  ];

  return (
    <div
      className="flex items-center justify-center w-full h-[100vh] mx-auto md:p-14"
      style={{
        backgroundImage: `url(${isMobile ? steperBgMobile : stepperBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        }
      `}</style>
      <div className="flex items-center justify-center w-full h-full">
        <div
          className="flex items-start justify-center w-full overflow-x-auto scrollbar-hide md:w-full md:overflow-visible"
        >
          {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className="flex flex-col items-center flex-1 w-[200px] z-10 relative"
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* ✅ Tick mark (kept from your logic) */}
              {currentStep >= index + 1 && (
                <div className="absolute top-5 right-4.5 z-20">
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

              <div className="relative flex items-center justify-center">
                <img
                  src={circlebg}
                  alt=""
                  className={`transition-opacity duration-200 ${
                    hoveredStep === index ? "opacity-100 z-[999]" : "opacity-0"
                  }`}
                />
                {/* Overlapping button centered on the image */}
                <button
                  onClick={() => onStepClick?.(index + 1)}
                  className={`absolute flex items-center justify-center w-[100px] h-[100px] rounded-full transition-all duration-200 ${
                    currentStep >= index + 1
                      ? "bg-[#01351f] text-white"
                      : "bg-[#01351f] text-gray-500"
                  } ${
                    onStepClick
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-default"
                  }`}
                >
                  <img src={step.icon} alt="" className="w-9" />
                </button>
              </div>

              {/* Step Number (visible under icon) */}
              <span
                className={`mt-0 text-3xl font-extrabold text-center tracking-tight ${
                  currentStep >= index + 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {step.number}
              </span>

              {/* Step Label */}
              <span
                className={`mt-1 text-sm font-medium text-center w-[140px] ${
                  currentStep >= index + 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>

              {/* Mobile detail card: tall pill design, based on current step */}
              {currentStep === index + 1 && (
                <div className="-mt-22 w-[165px] bg-[#01351f] text-white rounded-[32px] shadow-[0_20px_45px_rgba(0,0,0,0.65)] transition-all duration-300 z-40 overflow-hidden min-h-[380px] md:hidden">
                  <div className="relative">
                    <img
                      src={jurneyImg}
                      alt="step visual"
                      className="w-full h-[210px] object-cover"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-4xl font-extrabold">{step.number}</h3>
                    <h4 className="text-base font-semibold mt-1">{step.label}</h4>
                    <p className="text-sm mt-3 text-gray-200">
                      {step.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Desktop / laptop hover popup: keep original behaviour */}
              {hoveredStep === index && (
                <div
                  className="hidden md:block absolute top-[130px] left-1/2 transform -translate-x-1/2 w-[150px] bg-[#01351f] text-white rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.65)] transition-all duration-300 z-50 overflow-hidden"
                >
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
                      {step.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mt-14 relative min-w-[20px] max-w-[120px] border-t-2 border-dotted border-gray-300"></div>
            )}
          </React.Fragment>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
