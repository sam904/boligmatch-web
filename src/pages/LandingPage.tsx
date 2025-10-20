import ServiceCarousel from "./Landingpage/ServiceCarousel";
import { useState } from "react";
import Stepper from "./Landingpage/Stepper";
import sampleImg from "/src/assets/userImages/footerLogo.svg";
import landingImg from "/src/assets/userImages/landing_img.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import landingPageIcons from "/src/assets/userImages/1.svg";
import landingPageIcons2 from "/src/assets/userImages/2.svg";
import landingPageIcons3 from "/src/assets/userImages/3.svg";
import landingPageIcons4 from "/src/assets/userImages/4.svg";
import { useTranslation } from "react-i18next";
import LoginChoiceModal from "../components/common/LoginChoiceModal";
import UserModal from "../components/common/UserModal";
import SignUpModal from "../components/common/SignUpModal";

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginChoice, setShowLoginChoice] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
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
      <LoginChoiceModal 
        open={showLoginChoice} 
        onClose={() => setShowLoginChoice(false)} 
        onSelect={() => { setShowLoginChoice(false); setShowUserModal(true); }}
      />
      <UserModal open={showUserModal} onClose={() => setShowUserModal(false)} />
      <SignUpModal open={showSignUpModal} onClose={() => setShowSignUpModal(false)} />
      <div className="absolute top-22 left-36 flex max-w-6xl mx-auto px-12 justify-between mt-0 h-[calc(100vh-100vh)]">
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
        <div className="flex justify-center">
          <button 
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#91C73D] rounded-lg px-4 font-semibold py-2 text-white hover:bg-[#7fb32d] transition-colors"
          >
            {t('landing.signUpButton')}
          </button>
        </div>
        <h1 className=" text-[76px] text-white leading-[66px] text-center rosting-script font-[400]">
          {t('landing.mainTitle')}
        </h1>
        <h2 className="text-white text-[60px] leading-[66px] tracking-[0%] text-center max-w-4xl mx-auto py-4 px-4 font-[800] plus-jakarta-sans">
          {t('landing.subtitle')}
        </h2>
        <p className="text-white text-center text-[18px] mx-auto max-w-7xl py-8 px-4 plus-jakarta-sans">
          {t('landing.description')}
        </p>
      </div>
      <ServiceCarousel />
      <div className="bg-[#043428] h-auto">
        <h1 className=" text-[52px] text-white leading-[66px]  text-center">
          {t('landing.transparentJourney')}
        </h1>
        <p className="text-white text-center text-[18px] mx-auto max-w-8xl py-8 px-4">
          {t('landing.futureDescription')}
        </p>
      </div>
      <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
      <div className="bg-[#043428] flex flex-col justify-center items-center pt-12 pb-12">
        <div className="text-center">
          <div className="mb-10">
            <img src={sampleImg} alt="" />
          </div>
        </div>
        <p className="text-white text-sm">
          {t('landing.contactInfo')}
        </p>
      </div>
    </div>
  );
}
