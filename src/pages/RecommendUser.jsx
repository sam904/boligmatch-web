import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import axios from "axios";
import UserHeader from "../features/users/UserPages/UserHeader";
import { FaPlayCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Servises from "/src/assets/supplierProfile/services.svg";
import facts from "/src/assets/userImages/faktaLogo.svg";

function RecommendUser() {
  const { recommendationKey } = useParams();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = Boolean(token);
  const { t, i18n } = useTranslation();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("da");
  const calledRef = useRef(false);
  const videoRef = useRef(null);

  // Define fetchRecommendation before useEffect that uses it
  const fetchRecommendation = React.useCallback(async () => {
    if (calledRef.current || !recommendationKey) return Promise.resolve();
    calledRef.current = true;

    try {
      const response = await axios.get(
        `https://boligmatch-api-mhqy4.ondigitalocean.app/api/Recommendation/getRecommendationsKeyByUserPartnerList/${recommendationKey}`
      );

      if (response.data.isSuccess) {
        const payload = response.data.output;
        const firstEntry = Array.isArray(payload) ? payload[0] : payload;

        // Extract partner ID from recommendation response
        // Note: API returns "patnerId" (typo) not "partnerId"
        const partnerId = firstEntry?.patnerId || firstEntry?.partnerId || null;
        if (partnerId) {
          sessionStorage.setItem("bm_recommendation_partner_id", partnerId.toString());
          
          // If authenticated, fetch partner data and store it, but don't navigate yet
          // Let the modal show first, then navigate after acceptance
          if (isAuthenticated) {
            try {
              const { partnerService } = await import("../services/partner.service");
              const partnerResponse = await partnerService.getById(Number(partnerId));
              if (partnerResponse?.output) {
                localStorage.setItem("bm_currentPartner", JSON.stringify(partnerResponse.output));
              }
            } catch (error) {
              console.error("Error fetching partner data:", error);
            }
          }
          
          // Set data for display (will be used by modal on LandingPage)
          setData(firstEntry || null);
        } else {
          setData(firstEntry || null);
        }

        if (firstEntry?.locale) {
          setCurrentLocale(firstEntry.locale);
          i18n.changeLanguage(firstEntry.locale);
        }
      } else {
        setError(response.data.errorMessage || "Failed to load recommendation");
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setError("Unable to load recommendation. Please try again later.");
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [recommendationKey, i18n, isAuthenticated]);

  useEffect(() => {
    if (recommendationKey) {
      // Always store the recommendation key in sessionStorage
      sessionStorage.setItem("bm_recommendation_key", recommendationKey);
      
      // Fetch recommendation data first (to get partner ID)
      fetchRecommendation().then(() => {
        // After fetching, always redirect to landing page to show modal
        // The modal will handle navigation after user accepts
        navigate("/", { replace: true });
      }).catch(() => {
        // If fetch fails, still redirect to show modal
        navigate("/", { replace: true });
      });
    } else {
      // If no key, redirect to home
      navigate("/", { replace: true });
    }
  }, [recommendationKey, navigate, fetchRecommendation]);

  // Video playback effect - must be called before any early returns
  useEffect(() => {
    if (isVideoPlaying && videoRef.current) {
      const v = videoRef.current;
      v.play().catch(() => {});
    }
  }, [isVideoPlaying]);

  // Helper function to get localized text
  const getLocalizedText = (textField) => {
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

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#91C73D] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#91C73D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <p className="text-gray-600">No recommendation data available.</p>
        </div>
      </div>
    );
  }

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

  const getPartnerName = () => {
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

  const getPartnerDescription = () => {
    if (partnerInfo?.descriptionLocalized) {
      return getLocalizedText(partnerInfo.descriptionLocalized);
    }
    if (partnerInfo?.textField1Localized) {
      return getLocalizedText(partnerInfo.textField1Localized);
    }
    return partnerInfo?.textField1 || "";
  };

  const getServicesContent = () => {
    if (partnerInfo?.textField3Localized) {
      const localizedContent = getLocalizedText(partnerInfo.textField3Localized);
      if (localizedContent) {
        if (localizedContent.includes("<")) {
          return (
            <div
              className="text-white w-full text-left services-container"
              dangerouslySetInnerHTML={{ __html: localizedContent }}
            />
          );
        }
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

    const textField3Content = partnerInfo?.textField3 || "";
    if (textField3Content) {
      if (textField3Content.includes("<")) {
        return (
          <div
            className="text-white w-full text-left services-container"
            dangerouslySetInnerHTML={{ __html: textField3Content }}
          />
        );
      }
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
    return null;
  };

  const getFactsContent = () => {
    if (partnerInfo?.textField2Localized) {
      const localizedContent = getLocalizedText(partnerInfo.textField2Localized);
      if (localizedContent) {
        if (localizedContent.includes("<")) {
          return (
            <div
              className="text-white text-sm space-y-2 w-full text-center"
              dangerouslySetInnerHTML={{ __html: localizedContent }}
            />
          );
        }
        return (
          <div className="text-white text-sm space-y-2 w-full text-center">
            {localizedContent.split("\n").map((line, index) =>
              line.trim() ? <p key={index}>{line.trim()}</p> : null
            )}
          </div>
        );
      }
    }

    const textField2Content = partnerInfo?.textField2 || "";
    if (textField2Content) {
      if (textField2Content.includes("<")) {
        return (
          <div
            className="text-white text-sm space-y-2 w-full text-center"
            dangerouslySetInnerHTML={{ __html: textField2Content }}
          />
        );
      }
      return (
        <div className="text-white text-sm space-y-2 w-full text-center">
          {textField2Content.split("\n").map((line, index) =>
            line.trim() ? <p key={index}>{line.trim()}</p> : null
          )}
        </div>
      );
    }
    return null;
  };

  const partnerLogo = partnerInfo?.logoUrl || partnerInfo?.imageUrl4 || "";
  const partnerVideoUrl = partnerInfo?.videoUrl || partnerInfo?.video || "";

  const handlePlayClick = () => {
    setIsVideoPlaying(true);
  };

  const getUIText = () => {
    const texts = {
      en: {
        services: "Services",
        facts: "Facts",
        recommendedBy: "Recommended By",
      },
      da: {
        services: "Services",
        facts: "Fakta",
        recommendedBy: "Anbefalet af",
      },
    };
    return texts[currentLocale] || texts.en;
  };

  const uiText = getUIText();
  const partnerName = getPartnerName();
  const partnerDescription = getPartnerDescription();

  return (
    <div className="w-full mx-auto relative">
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
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
              style={{
                backgroundImage: `url(${getBackgroundImage()})`,
              }}
            ></div>

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
            recommendingUser?.email ||
            recommendingUser?.mobileNo) && (
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
                  {recommendingUser?.email && <p>{recommendingUser.email}</p>}
                  {recommendingUser?.mobileNo && (
                    <p>
                      {currentLocale === "da" ? "Tlf:" : "Phone:"} {recommendingUser.mobileNo}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecommendUser;