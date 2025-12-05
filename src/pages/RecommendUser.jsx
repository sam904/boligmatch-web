import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import UserHeader from "../features/users/UserPages/UserHeader";
import { FaPlayCircle } from "react-icons/fa";
import LoginChoiceModal from "../components/common/LoginChoiceModal";
import UserModal from "../components/common/UserModal";
import { useAppSelector } from "../app/hooks";
import { useTranslation } from "react-i18next";
import Servises from "/src/assets/supplierProfile/services.svg";
import facts from "/src/assets/userImages/faktaLogo.svg";
import boligmatchLogo from "/src/assets/userImages/loginModelLogo.svg";

function RecommendUser() {
  const { recommendationKey } = useParams();
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { t, i18n } = useTranslation();
  const isAuthenticated = Boolean(token);
  const [showChoice, setShowChoice] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalRole, setModalRole] = useState("user");
  const [data, setData] = useState(null);
  console.log("data------>", data);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [currentLocale, setCurrentLocale] = useState("da");
  const calledRef = useRef(false);
  const videoRef = useRef(null);

  // Helper function to get localized text
  const getLocalizedText = (textField) => {
    if (!textField) return "";

    // If it's an object with locale keys (like {en: "...", da: "..."})
    if (typeof textField === "object" && textField !== null) {
      // Try current locale first, then default to 'en', then any available value
      return (
        textField[currentLocale] ||
        textField.en ||
        Object.values(textField)[0] ||
        ""
      );
    }

    // If it's already a string
    if (typeof textField === "string") {
      return textField;
    }

    return "";
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setShowChoice(true);
    } else {
      setShowChoice(false);
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (recommendationKey) {
      fetchRecommendation();
    }
  }, [recommendationKey]);

  const fetchRecommendation = async () => {
    if (calledRef.current) {
      return;
    }
    calledRef.current = true;

    try {
      const response = await axios.get(
        `https://boligmatch-api-mhqy4.ondigitalocean.app/api/Recommendation/getRecommendationsKeyByUserPartnerList/${recommendationKey}`
      );

      console.log("✅ API Response:", response.data);

      if (response.data.isSuccess) {
        const payload = response.data.output;
        const firstEntry = Array.isArray(payload) ? payload[0] : payload;
        setData(firstEntry || null);

        // Set locale from API response if available
        if (firstEntry?.locale) {
          setCurrentLocale(firstEntry.locale);
          // Also update i18n language
          i18n.changeLanguage(firstEntry.locale);
        }
      } else {
        setError(response.data.errorMessage || "Failed to load recommendation");
      }
    } catch (error) {
      console.log("❌ API Error:", error);
      setError("Unable to load recommendation. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const partnerInfo = data?.partner ?? data ?? null;
  const recommendingUser =
    data?.user ??
    (data
      ? {
          fullName: data.userName,
          email: data.userEmail,
          mobileNo: data.userMobileNo,
        }
      : null);

  const getBackgroundImage = () => {
    return partnerInfo?.thumbnail || partnerInfo?.imageUrl1 || "";
  };

  // Get localized partner information
  const getPartnerName = () => {
    // Check for localized name fields
    if (partnerInfo?.businessNameLocalized) {
      return getLocalizedText(partnerInfo.businessNameLocalized);
    }
    if (partnerInfo?.fullNameLocalized) {
      return getLocalizedText(partnerInfo.fullNameLocalized);
    }
    // Fallback to non-localized fields
    return (
      partnerInfo?.businessName ||
      partnerInfo?.partnerName ||
      partnerInfo?.fullName ||
      ""
    );
  };

  const getPartnerDescription = () => {
    // Check for localized description fields
    if (partnerInfo?.descriptionLocalized) {
      return getLocalizedText(partnerInfo.descriptionLocalized);
    }
    // Use textField1 for partner description (as per your requirement)
    if (partnerInfo?.textField1Localized) {
      return getLocalizedText(partnerInfo.textField1Localized);
    }
    // Fallback to non-localized textField1
    return partnerInfo?.textField1 || "";
  };

  const getServicesContent = () => {
    // Use textField3 for services (localized version first)
    if (partnerInfo?.textField3Localized) {
      const localizedContent = getLocalizedText(
        partnerInfo.textField3Localized
      );
      if (localizedContent) {
        // If it's HTML content
        if (localizedContent.includes("<")) {
          return (
            <div
              className="text-white w-full text-left services-container"
              dangerouslySetInnerHTML={{ __html: localizedContent }}
            />
          );
        }
        // If it's plain text with bullet points
        return (
          <div className="text-white w-full text-left">
            {localizedContent.split("\n").map((line, index) =>
              line.trim() ? (
                <div key={index} className="flex items-start mb-2">
                  <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>{line.trim()}</span>
                </div>
              ) : null
            )}
          </div>
        );
      }
    }

    // Fallback to non-localized textField3
    const textField3Content = partnerInfo?.textField3 || "";
    if (textField3Content) {
      // If it's HTML content
      if (textField3Content.includes("<")) {
        return (
          <div
            className="text-white w-full text-left services-container"
            dangerouslySetInnerHTML={{ __html: textField3Content }}
          />
        );
      }
      // If it's plain text with bullet points
      return (
        <div className="text-white w-full text-left">
          {textField3Content.split("\n").map((line, index) =>
            line.trim() ? (
              <div key={index} className="flex items-start mb-2">
                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mt-2 mr-2 flex-shrink-0"></span>
                <span>{line.trim()}</span>
              </div>
            ) : null
          )}
        </div>
      );
    }

    // Return null if no content is available
    return null;
  };

  const getFactsContent = () => {
    // Use textField2 for facts (localized version first)
    if (partnerInfo?.textField2Localized) {
      const localizedContent = getLocalizedText(
        partnerInfo.textField2Localized
      );
      if (localizedContent) {
        // If it's HTML content
        if (localizedContent.includes("<")) {
          return (
            <div
              className="text-white text-sm space-y-2 w-full text-center"
              dangerouslySetInnerHTML={{ __html: localizedContent }}
            />
          );
        }
        // If it's plain text
        return (
          <div className="text-white text-sm space-y-2 w-full text-center">
            {localizedContent
              .split("\n")
              .map((line, index) =>
                line.trim() ? <p key={index}>{line.trim()}</p> : null
              )}
          </div>
        );
      }
    }

    // Fallback to non-localized textField2
    const textField2Content = partnerInfo?.textField2 || "";
    if (textField2Content) {
      // If it's HTML content
      if (textField2Content.includes("<")) {
        return (
          <div
            className="text-white text-sm space-y-2 w-full text-center"
            dangerouslySetInnerHTML={{ __html: textField2Content }}
          />
        );
      }
      // If it's plain text
      return (
        <div className="text-white text-sm space-y-2 w-full text-center">
          {textField2Content
            .split("\n")
            .map((line, index) =>
              line.trim() ? <p key={index}>{line.trim()}</p> : null
            )}
        </div>
      );
    }

    // Return null if no content is available
    return null;
  };

  const partnerLogo = partnerInfo?.logoUrl || partnerInfo?.imageUrl4 || "";
  const partnerVideoUrl = partnerInfo?.videoUrl || partnerInfo?.video || "";

  const handlePlayClick = () => {
    console.log("Play video clicked");
    setIsVideoPlaying(true);
  };

  const handleAcceptRecommendation = () => {
    setShowIntroModal(false);
  };

  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      // Trigger play programmatically for better iOS/Android support
      const v = videoRef.current;
      v.play().catch(() => {});
    }
  }, [isVideoPlaying]);

  // Get localized text for UI elements
  const getUIText = () => {
    const texts = {
      en: {
        services: "Services",
        facts: "Facts",
        recommendedBy: "Recommended By",
        recommendedText:
          "has recommended that you take a closer look at our partner",
        loading: "Loading recommendation...",
        error: "Error",
        noData: "No recommendation data available.",
        phoneLabel: "Phone:",
        acceptButton: "Accept recommendation",
        anonymousUser: "A user",
        partnerFallback: "Our partner",
        description:
          "If this sounds interesting, click the button below to create a free Boligmatch+ account. Boligmatch+ is a digital platform with a fresh and user-friendly approach where home enthusiasts can discover curated products and services for their home from our many skilled partners.",
      },
      da: {
        services: "Services",
        facts: "Fakta",
        recommendedBy: "Anbefalet af",
        recommendedText: "har anbefalet dig at kigge nærmere på vores partner",
        loading: "Indlæser anbefaling...",
        error: "Fejl",
        noData: "Ingen anbefalingsdata tilgængelig.",
        phoneLabel: "Tlf:",
        acceptButton: "Accepter anbefaling",
        anonymousUser: "En bruger",
        partnerFallback: "Vores partner",
        description:
          "Hvis det har din interesse, så klik på knappen herunder og opret dig nemt og gratis som bruger på Boligmatch+. Boligmatch+ er en digital platform med en nytænkende og brugervenlig tilgang, hvor alle boliginteresserede kan finde produkter og services til hjemmet blandt vores mange dygtige partnere.",
      },
    };

    return texts[currentLocale] || texts.en;
  };

  const uiText = getUIText();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#91C73D] mx-auto mb-4"></div>
          <p className="text-gray-600">{uiText.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {uiText.error}
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <p className="text-gray-600">{uiText.noData}</p>
        </div>
      </div>
    );
  }

  const partnerName = getPartnerName();
  const partnerDescription = getPartnerDescription();

  return (
    <div className="w-full mx-auto relative">
      {/* Always render the page content */}
      <>
        {/* Auth Modals */}
        <LoginChoiceModal
          open={showChoice}
          onClose={() => setShowChoice(false)}
          onSelect={(role) => {
            setShowChoice(false);
            setModalRole(role === "partner" ? "partner" : "user");
            setShowAuthModal(true);
          }}
          closable={false}
        />
        <UserModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          redirectTo={location.pathname}
          roleTarget={modalRole}
          showSignUp={modalRole === "user"}
          hideCloseIcon={true}
          closable={false}
          enableAutoLoginAfterSignup={true}
        />

        {/* Hero Section with Video/Image */}
        <div
          className="h-[100vh] relative"
          onClick={() => {
            if (!isVideoPlaying && partnerVideoUrl) handlePlayClick();
          }}
          role="button"
          aria-label="Play partner video"
        >
          {!isVideoPlaying ? (
            <>
              {/* Thumbnail Background */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url(${getBackgroundImage()})`,
                }}
              ></div>

              {/* Play Button */}
              {partnerVideoUrl && (
                <div
                  className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[60]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick();
                  }}
                  role="button"
                  aria-label="Play video"
                >
                  <FaPlayCircle className="h-14 w-14 cursor-pointer hover:scale-110 transition-transform text-white" />
                </div>
              )}
            </>
          ) : (
            /* Video Player */
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              muted
              poster={getBackgroundImage()}
              onEnded={() => setIsVideoPlaying(false)}
              onCanPlay={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onError={(e) => {
                console.error("Video failed to load/play", e);
              }}
            >
              <source src={partnerVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Header - Always visible */}
          <div className="absolute top-0 left-0 w-full z-50">
            <UserHeader />
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white overflow-hidden">
          <div className="p-8 text-white bg-[#01351f]">
            <div className="bg-[#01351f] pt-10">
              <h1 className="font-extrabold text-6xl text-center text-white py-10">
                {partnerName || "Loading..."}
              </h1>
              <div className="max-w-6xl m-auto">
                <p className="text-white font-[400] text-[18px] text-center">
                  {partnerDescription || "Short Description not available."}
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl p-6 rounded-lg">
                {/* Logo Card */}
                <div className="bg-white rounded-[10px] w-[403px] h-[432px] flex justify-center items-center">
                  <div className="text-center">
                    <img
                      src={partnerLogo}
                      alt={partnerName}
                      className="w-[177px] h-[164px] object-contain mx-auto"
                    />
                    <h2 className="font-extrabold text-[30px] leading-[76px] text-black text-center">
                      {partnerName}
                    </h2>
                  </div>
                </div>

                {/* Services Card */}
                <div
                  className="w-[403px] h-[432px] rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start"
                  style={{
                    background:
                      "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
                  }}
                >
                  <img
                    src={Servises}
                    alt="Services"
                    className="w-[88px] h-[77px] select-none"
                  />
                  <h2 className="text-white text-[28px] font-[700] py-4">
                    {uiText.services}
                  </h2>
                  {getServicesContent() || (
                    <p className="text-white text-center">
                      No services information available
                    </p>
                  )}
                </div>

                {/* Fakta Card */}
                <div
                  className="w-[403px] h-[432px] rounded-[10px] flex flex-col items-center gap-[10px] p-[53px_34px]"
                  style={{
                    background:
                      "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                  }}
                >
                  <img
                    src={facts}
                    alt="Fakta"
                    className="w-[59px] h-[63px] select-none"
                  />
                  <h2 className="text-white text-[28px] font-[700] py-4">
                    {uiText.facts}
                  </h2>
                  {getFactsContent() || (
                    <p className="text-white text-center">
                      No facts information available
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Recommended by (User details) */}
            {(recommendingUser?.fullName ||
              recommendingUser?.email || // Use user email
              recommendingUser?.mobileNo) && ( // Use user mobile number
              <div className="max-w-7xl mx-auto px-6 pb-10">
                <div className="mt-2 bg-white rounded-[10px] p-6 text-center shadow-sm">
                  <h3 className="text-[#01351f] text-xl font-bold">
                    {uiText.recommendedBy}
                  </h3>
                  {recommendingUser?.fullName && (
                    <p className="mt-2 text-gray-900 font-semibold">
                      {recommendingUser.fullName}
                    </p>
                  )}
                  <div className="mt-1 space-y-1 text-gray-700">
                    {/* Show user email */}
                    {recommendingUser?.email && <p>{recommendingUser.email}</p>}
                    {/* Show user mobile number */}
                    {recommendingUser?.mobileNo && (
                      <p>
                        {uiText.phoneLabel} {recommendingUser.mobileNo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>

      {/* Introductory Modal - Fixed position on top of content */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Semi-transparent overlay - allows content behind to be visible */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Modal content */}
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
                {recommendingUser?.fullName?.trim() || uiText.anonymousUser}
              </span>{" "}
              {uiText.recommendedText.toLowerCase()}:
            </p>
            <h3 className="text-2xl font-bold text-black mt-4">
              {partnerName || uiText.partnerFallback}
            </h3>
            <p className="text-[15px] text-gray-600 mt-4">
              {uiText.description}
            </p>
            <button
              className="mt-6 w-full bg-[#95C11F] text-white font-semibold py-3 rounded-full shadow hover:bg-[#7cab1a] transition-colors cursor-pointer"
              onClick={handleAcceptRecommendation}
            >
              {uiText.acceptButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendUser;