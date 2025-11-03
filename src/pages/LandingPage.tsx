import ServiceCarousel from "./Landingpage/ServiceCarousel";
import { useState } from "react";
import Stepper from "./Landingpage/Stepper";
import landingImg from "/src/assets/userImages/landing_img.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import landingPageIcons from "/src/assets/userImages/1.svg";
import landingPageIcons2 from "/src/assets/userImages/2.svg";
import landingPageIcons3 from "/src/assets/userImages/3.svg";
import landingPageIcons4 from "/src/assets/userImages/4.svg";
import { useTranslation } from "react-i18next";
import SignUpModal from "../components/common/SignUpModal";
import footerLogo from "/src/assets/userImages/footerLogo.svg"

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      className="relative h-[100vh]"
      style={{
        backgroundImage: `url(${landingImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      <SignUpModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} />
      <div className="absolute top-44 left-78 flex max-w-6xl mx-auto px-12 justify-between mt-0 h-[calc(100vh-100vh)]">
        <div>
          <div className="w-[150px] flex justify-end">
            <img src={landingPageIcons} alt="" className="w-24 h-auto" />
          </div>
          <div className="">
            <img src={landingPageIcons2} alt="" className="w-24 h-auto" />
          </div>
          <div className="">
            <img src={landingPageIcons3} alt="" className="w-24 h-auto" />
          </div>
          <div className="w-[150px] flex justify-end">
            <img src={landingPageIcons4} alt="" className="w-24 h-auto" />
          </div>
        </div>
      </div>

      <div className="bg-[#043428] h-auto">
        <div className="flex justify-center absolute bottom-0 left-[46%]">
          <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#91C73D] rounded-lg text-[18px] cursor-pointer px-4 font-semibold py-2 text-white hover:bg-[#7fb32d] transition-colors figtree"
          >
            {t('landing.signUpButton')}
          </button>
        </div>
        <h1 className=" text-[76px] text-white leading-[66px] text-center rosting-script font-[400]">
          {t('landing.mainTitle')}
        </h1>
        <h2 className="text-white text-[60px] leading-[66px] tracking-[0%] text-center max-w-4xl mx-auto py-1 px-4 font-[800] plus-jakarta-sans">
          {t('landing.subtitle')}
        </h2>
        <p className="text-white text-center text-[18px] mx-auto max-w-7xl py-8 px-4 plus-jakarta-sans">
          {t('landing.description')}
        </p>
      </div>
      <ServiceCarousel />
      <div className="bg-[#043428] h-auto">
        <h1 className="text-[64px] leading-[66px] text-white text-center max-w-[845px] mx-auto font-[800] plus-jakarta-sans">
          {t('landing.transparentJourney')}
        </h1>
        <p className="text-white text-center text-[18px] mx-auto max-w-8xl py-8 px-4">
          {t('landing.futureDescription')}
        </p>
      </div>
      <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
      <footer className="bg-[#043428] text-white text-center p-4 pt-32">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-[199px] h-[45px] mx-auto">
                <img
                  src={footerLogo}
                  alt="Boligmatch Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <p className="text-white text-sm figtree font-[400] text-[18px]">
            {t('landing.contactInfo')}
          </p>
        </div>
      </footer>
    </div>
  );
}
