import ServiceCarousel from "./Landingpage/ServiceCarousel";
import { useEffect, useState, useRef } from "react";
import Stepper from "./Landingpage/Stepper";
import UserHeader from "../features/users/UserPages/UserHeader";
import landingPageIcons from "/src/assets/userImages/1.svg";
import landingPageIcons2 from "/src/assets/userImages/2.svg";
import landingPageIcons3 from "/src/assets/userImages/3.svg";
import landingPageIcons4 from "/src/assets/userImages/4.svg";
import { useTranslation } from "react-i18next";
import SignUpModal from "../components/common/SignUpModal";
import UserModal from "../components/common/UserModal";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { loginThunk } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import axios from "axios";
import boligmatchLogo from "/src/assets/userImages/loginModelLogo.svg";


export default function LandingPage() {
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  
  // Recommendation modal state
  type PartnerInfo = {
    businessNameLocalized?: any;
    fullNameLocalized?: any;
    businessName?: string;
    partnerName?: string;
    fullName?: string;
  };
  
  type RecommendationData = ({
    partner?: PartnerInfo;
    user?: {
      fullName?: string;
      email?: string;
      mobileNo?: string;
    };
    userName?: string;
    userEmail?: string;
    userMobileNo?: string;
    locale?: string;
    patnerId?: number;
    partnerId?: number;
  } & Partial<PartnerInfo>) | null;
  
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationData, setRecommendationData] = useState<RecommendationData>(null);
  const [recommendationKey, setRecommendationKey] = useState<string | null>(null);
  const [currentLocale, setCurrentLocale] = useState<"en" | "da">("da");
  const calledRef = useRef(false);

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
      setShowRecommendationModal(false);
      
      // Navigate to supplier profile page if partner ID exists
      const partnerId = sessionStorage.getItem("bm_recommendation_partner_id");
      if (partnerId) {
        // Fetch partner data and store in localStorage for SupplierProfile
        try {
          const { partnerService } = await import("../services/partner.service");
          const partnerResponse = await partnerService.getById(Number(partnerId));
          if (partnerResponse?.output) {
            localStorage.setItem("bm_currentPartner", JSON.stringify(partnerResponse.output));
          }
        } catch (error) {
          console.error("Error fetching partner data:", error);
        }
        navigate("/user/supplier-profile", { replace: true });
        // Clear the recommendation keys
        sessionStorage.removeItem("bm_recommendation_key");
        sessionStorage.removeItem("bm_recommendation_partner_id");
      } else if (recommendationKey) {
        // Fallback to recommendation page if no partner ID
        navigate(`/user/recommenduser/${recommendationKey}`, { replace: true });
      }
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

  // Check for recommendation key and fetch data
  useEffect(() => {
    const storedKey = sessionStorage.getItem("bm_recommendation_key");
    if (storedKey && !calledRef.current) {
      setRecommendationKey(storedKey);
      fetchRecommendation(storedKey);
    }
  }, []);

  const fetchRecommendation = async (recommendationKey: string) => {
    if (calledRef.current) {
      return;
    }
    calledRef.current = true;

    try {
      const response = await axios.get(
        `https://boligmatch-api-mhqy4.ondigitalocean.app/api/Recommendation/getRecommendationsKeyByUserPartnerList/${recommendationKey}`
      );

      if (response.data.isSuccess) {
        const payload = response.data.output;
        const firstEntry = Array.isArray(payload) ? payload[0] : payload;
        setRecommendationData(firstEntry || null);

        // Extract partner ID from recommendation response
        // Note: API returns "patnerId" (typo) not "partnerId"
        const partnerId = firstEntry?.patnerId || firstEntry?.partnerId || null;
        if (partnerId) {
          sessionStorage.setItem("bm_recommendation_partner_id", partnerId.toString());
        }

        // Set locale from API response if available
        if (firstEntry?.locale && (firstEntry.locale === "en" || firstEntry.locale === "da")) {
          setCurrentLocale(firstEntry.locale as "en" | "da");
          i18n.changeLanguage(firstEntry.locale);
        }
        
        // Show modal after data is loaded
        setShowRecommendationModal(true);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    }
    // Don't clear the recommendation key here - keep it for navigation after login
  };

  // Helper function to get localized text
  const getLocalizedText = (textField: any) => {
    if (!textField) return "";
    if (typeof textField === "object" && textField !== null) {
      return (
        textField[currentLocale] ||
        textField.en ||
        Object.values(textField)[0] ||
        ""
      );
    }
    if (typeof textField === "string") {
      return textField;
    }
    return "";
  };

  const handleAcceptRecommendation = () => {
    setShowRecommendationModal(false);
    setShowSignUpModal(true);
  };

  const getPartnerName = () => {
    const partnerInfo = recommendationData?.partner ?? recommendationData ?? null;
    if (partnerInfo?.businessNameLocalized) {
      return getLocalizedText(partnerInfo.businessNameLocalized);
    }
    if (partnerInfo?.fullNameLocalized) {
      return getLocalizedText(partnerInfo.fullNameLocalized);
    }
    return (
      partnerInfo?.businessName ||
      partnerInfo?.partnerName ||
      partnerInfo?.fullName ||
      ""
    );
  };

  const getRecommendationUser = () => {
    return (
      recommendationData?.user ??
      (recommendationData
        ? {
            fullName: recommendationData.userName,
            email: recommendationData.userEmail,
            mobileNo: recommendationData.userMobileNo,
          }
        : null)
    );
  };

  const getUIText = () => {
    const texts = {
      en: {
        recommendedText: "has recommended that you take a closer look at our partner",
        acceptButton: "Accept recommendation",
        anonymousUser: "A user",
        partnerFallback: "Our partner",
        description:
          "If this sounds interesting, click the button below to create a free Boligmatch+ account. Boligmatch+ is a digital platform with a fresh and user-friendly approach where home enthusiasts can discover curated products and services for their home from our many skilled partners.",
      },
      da: {
        recommendedText: "har anbefalet dig at kigge nærmere på vores partner",
        acceptButton: "Accepter anbefaling",
        anonymousUser: "En bruger",
        partnerFallback: "Vores partner",
        description:
          "Hvis det har din interesse, så klik på knappen herunder og opret dig nemt og gratis som bruger på Boligmatch+. Boligmatch+ er en digital platform med en nytænkende og brugervenlig tilgang, hvor alle boliginteresserede kan finde produkter og services til hjemmet blandt vores mange dygtige partnere.",
      },
    };
    return texts[currentLocale] || texts.en;
  };
  return (
    <div
    className="
    h-[400px]
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
        onSwitchToLogin={() => setShowLoginModal(true)}
      />
      <UserModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={undefined}
        roleTarget="user"
        showSignUp={false}
        enableAutoLoginAfterSignup={false}
      />
      
      {/* Recommendation Modal */}
      {showRecommendationModal && recommendationData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-[10000] w-full max-w-sm bg-white rounded-2xl shadow-2xl px-6 py-7 text-center">
            <div className="relative flex justify-center items-start">
              <div className="">
                <img
                  className="h-[36px] w-auto"
                  src={boligmatchLogo}
                  alt="Boligmatch"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-bold text-black">
                {getRecommendationUser()?.fullName?.trim() || getUIText().anonymousUser}
              </span>{" "}
              {getUIText().recommendedText.toLowerCase()}:
            </p>
            <h3 className="text-2xl font-bold text-black mt-4">
              {getPartnerName() || getUIText().partnerFallback}
            </h3>
            <p className="text-[15px] text-gray-600 mt-4">
              {getUIText().description}
            </p>
            <button
              className="mt-6 w-full bg-[#95C11F] text-white font-semibold py-3 rounded-full shadow hover:bg-[#7cab1a] transition-colors cursor-pointer"
              onClick={handleAcceptRecommendation}
            >
              {getUIText().acceptButton}
            </button>
          </div>
        </div>
      )}

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

      <div className="pt-46 md:pt-0">
        
        <div  style={{top: isMobile ? "350px" : "", }} className="md:absolute md:bottom-0 md:h-[350px] h-[350px]  flex flex-col items-center justify-end bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] w-full ">
         {isMobile ? 
         <>
          <div className="absolute z-10  bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-100%  w-full items-center justify-center flex flex-col">
           <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#91C73D]  w-[188px]
                h-[55px] rounded-xl md:text-[18px] text-[16px] cursor-pointer px-7
            font-semibold  text-white hover:bg-[#7fb32d] transition-colors figtree"
          >
            {t("landing.signUpButton")}
          </button>
          <div className="bg-[#01351f]">
             <h1 className="md:text-[66px] leading-15 text-[40px] bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-98%   w-full text-white  text-center rosting-script font-[400] px-4">
            {t("landing.mainTitle")}
          </h1>
          <div className=" w-full ">
            <h2 className="text-white md:text-[50px] text-[40px]   leading-[50px]  max-w-4xl tracking-[0%] text-center  md:mx-auto mx-8 pb-3 px-4 font-[800] plus-jakarta-sans">
             {t("landing.subtitle")}
          </h2>
          </div>
           <p className="text-[#FFFFFF] text-center md:text-[18px] text-[13px] mx-auto max-w-7xl md:py-8 py-2 px-4 plus-jakarta-sans">
          {t("landing.description")}
        </p>
        
          </div>
          </div> 
         
         </>
         : <> <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#91C73D]  w-[188px]
                h-[55px] rounded-xl md:text-[18px] text-[16px] cursor-pointer px-7
            font-semibold  text-white hover:bg-[#7fb32d] transition-colors figtree"
          >
            {t("landing.signUpButton")}
          </button>
           <h1 className="md:text-[66px] leading-15 text-[40px] bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-98%   w-full text-white  text-center rosting-script font-[400] px-4">
            {t("landing.mainTitle")}
          </h1>
          <div className="bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F] to-0% w-full">
            <h2 className="text-white md:text-[50px] text-[40px] bg-gradient-to-b from-[rgba(1,53,31,0)] to-[#01351F]   leading-[50px]  max-w-4xl tracking-[0%] text-center  md:mx-auto mx-8 pb-3 px-4 font-[800] plus-jakarta-sans">
             {t("landing.subtitle")}
          </h2>
          </div>
          </>
          }
        </div>
      </div>
      {!isMobile && 
      <div className="bg-[#01351f] ">
        <p className="text-[#FFFFFF] text-center md:text-[18px] text-[13px] mx-auto max-w-7xl md:py-8 py-2 px-4 plus-jakarta-sans">
          {t("landing.description")}
        </p>
      </div>
      }
       <ServiceCarousel />
        <div className="bg-[#01351f] py-11">
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
