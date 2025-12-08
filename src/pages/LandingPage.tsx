import ServiceCarousel from "./Landingpage/ServiceCarousel";
import { useEffect, useState } from "react";
import Stepper from "./Landingpage/Stepper";
import UserHeader from "../features/users/UserPages/UserHeader";
import landingPageIcons from "/src/assets/userImages/1.svg";
import landingPageIcons2 from "/src/assets/userImages/2.svg";
import landingPageIcons3 from "/src/assets/userImages/3.svg";
import landingPageIcons4 from "/src/assets/userImages/4.svg";
import { useTranslation } from "react-i18next";
import SignUpModal from "../components/common/SignUpModal";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { loginThunk } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";


export default function LandingPage() {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

  const handleSignupSuccess = async (email: string, password: string) => {
    // Auto-login after successful signup
    try {
      await dispatch(loginThunk({ userName: email, password }));
      setShowSignUpModal(false);
    } catch (error) {
      // If auto-login fails, just close signup modal and let user login manually
    }
  };
  useEffect(() => {
    try {
      const rawPartner =
        typeof window !== "undefined"
          ? localStorage.getItem("bm_partner")
          : null;
      if (rawPartner) {
        const partner = JSON.parse(rawPartner);
        if (partner && partner.roleName === "Partner") {
          //navigate("/partner/statistics", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error reading bm_partner from localStorage:", error);
    }
  }, [navigate]);
  return (
    <div
    className="
    h-[366px]
    md:h-[100vh] bg-cover bg-center bg-no-repeat
    bg-[url('/src/assets/userImages/landingImgMobile.png')]   // mobile default
    md:bg-[url('/src/assets/userImages/home_pageImg.png')]       // desktop
  "
    >
      <UserHeader showBackButton={false} />
      <SignUpModal
        open={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSignupSuccess={handleSignupSuccess}
      />
      <div className="absolute md:top-28 top-28 lg:left-93 left-0 flex max-w-6xl mx-auto md:px-12 px-8 justify-between mt-0 md:h-[calc(100vh)]">
        <div>
          <div className="md:w-[130px] w-[70px] flex justify-end">
            <img
              src={landingPageIcons}
              alt=""
              className="md:w-[80px] w-10 h-auto shadow-black shadow-2xl rounded-full"
            />
          </div>
          <div className="mb-2">
            <img
              src={landingPageIcons2}
              alt=""
              className="md:w-[80px] w-10 h-auto shadow-black shadow-2xl rounded-full"
            />
          </div>
          <div className="">
            <img
              src={landingPageIcons3}
              alt=""
              className="md:w-[80px] w-10 h-auto shadow-black shadow-2xl rounded-full"
            />
          </div>
          <div className="md:w-[130px] w-[70px] flex justify-end">
            <img
              src={landingPageIcons4}
              alt=""
              className="md:w-[80px] w-10 h-auto shadow-black shadow-2xl rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="relative ">
        
        <div  style={{top: isMobile ? "0px" : "", }} className="absolute md:bottom-0 md:h-[350px] h-[280px]  flex flex-col items-center justify-end bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] w-full ">
          <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#91C73D] rounded-lg md:text-[18px] text-[16px] cursor-pointer px-6 font-semibold md:py-2.5 mb-1.5 py-2 text-white hover:bg-[#7fb32d] transition-colors figtree"
          >
            {t("landing.signUpButton")}
          </button>
          <h1 className="md:text-[66px] text-[40px] bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-98%   w-full text-white  text-center rosting-script font-[400] px-4">
            {t("landing.mainTitle")}
          </h1>
          <div className="bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-0% w-full">
            <h2 className="text-white md:text-[50px] text-[40px] bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F]   leading-[50px]  max-w-4xl tracking-[0%] text-center  md:mx-auto mx-8 py-0 px-4 font-[800] plus-jakarta-sans">
             {t("landing.subtitle")}
          </h2>
          </div>
        </div>
      </div>
      <div className="bg-[#01351f] ">
        <p className="text-[#FFFFFF] text-center md:text-[18px] text-[13px] mx-auto max-w-7xl md:py-8 py-2 px-4 plus-jakarta-sans">
          {t("landing.description")}
        </p>
      </div>
      {/* <AquaticAnimalsCarousel/> */}
      <ServiceCarousel />
      <div className="bg-[#01351f] h-auto">
        <h1 className="md:text-[64px] text-[42px] md:leading-[66px] leading-[42px] text-white text-center max-w-[845px] mx-auto font-[800] plus-jakarta-sans">
          {t("landing.transparentJourney")}
        </h1>
        <p className="text-white text-center md:text-[18px] text-[16px] mx-auto max-w-7xl py-4 px-4">
          {t("landing.futureDescription")}
        </p>
      </div>
      <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
      <Footer />
    </div>
  );
}
