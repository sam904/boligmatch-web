import { useEffect, useRef, useState } from "react";
import { partnerService } from "../../../services/partner.service";
import Footer from "../../../pages/Footer";
import trustPilotLogo from "/src/assets/userImages/boligmatchLogo2.svg";
import ratingImg from "/src/assets/userImages/rating.svg";
import fullRatingImg from "/src/assets/userImages/ratig2.svg";
import servicesImg from "/src/assets/supplierProfile/services.svg";
import factsImg from "/src/assets/userImages/faktaLogo.svg";
import kabelLogoImg from "/src/assets/userImages/kabelLogoImg.svg";
import startImg from "/src/assets/userImages/star.svg";
import { useTranslation } from "react-i18next";
import circlePartner from "/src/assets/userImages/circlePartner.svg";
import ScrollToTop from "../../../components/common/ScrollToTop";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";

function PartnerProfileShortcut({
  partnerData: initialPartnerData,
}: {
  partnerData?: any;
}) {
  const { t } = useTranslation();
  const [partnerData, setPartnerData] = useState<any>(
    initialPartnerData || null
  );
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoElement, setShowVideoElement] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [_currentTime, setCurrentTime] = useState(0);
  const [_duration, setDuration] = useState(0);

  const reviews: any[] = Array.isArray(partnerData?.testImo)
    ? partnerData.testImo.filter((r: any) => r && r.isDisplayed)
    : [];

  const getCurrentPartnerId = (): number | null => {
    try {
      const stored = localStorage.getItem("bm_partner");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const candidate = parsed?.partnerId ?? parsed?.id;
      const id = Number(candidate);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  };

  // Video event handlers
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const handlePlay = () => {
        setIsVideoPlaying(true);
        setShowVideoElement(true);
      };

      const handlePause = () => {
        setIsVideoPlaying(false);
      };

      const handleEnded = () => {
        setIsVideoPlaying(false);
        setShowVideoElement(false);
      };

      const handleTimeUpdate = () => {
        if (videoElement) {
          setCurrentTime(videoElement.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        if (videoElement) {
          setDuration(videoElement.duration);
        }
      };

      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("ended", handleEnded);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("ended", handleEnded);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    }
  }, []);

  const handlePlayClick = () => {
    if (videoRef.current) {
      setShowVideoElement(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error("Error playing video:", error);
            setShowVideoElement(false);
          });
        }
      }, 50);
    }
  };

  const handlePauseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Get background image for the hero section
  const getBackgroundImage = () => {
    return partnerData?.imageUrl1 || partnerData?.thumbnail || "";
  };

  // Update the getReferences function to handle HTML
  const renderReferencesContent = () => {
    if (!partnerData?.textField4) {
      return (
        <div className="text-white text-center py-4">
          <p>Ingen referencer tilgængelige</p>
        </div>
      );
    }

    // Create a safe HTML object
    const createMarkup = () => {
      return { __html: partnerData.textField4 };
    };

    return (
      <div
        className="references-html-content text-white w-full text-left"
        dangerouslySetInnerHTML={createMarkup()}
      />
    );
  };

  // Updated getServices to preserve HTML formatting
  const renderServicesContent = () => {
    if (!partnerData?.textField3) {
      return (
        <ul className="text-white list-none space-y-2 w-full">
          <li className="relative pl-5">
            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
            Løsning af fejl og fejlfinding
          </li>
          <li className="relative pl-5">
            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
            Intelligente hjemsystemer
          </li>
        </ul>
      );
    }

    // Create a safe HTML object
    const createMarkup = () => {
      return { __html: partnerData.textField3 };
    };

    return (
      <div
        className="services-html-content text-white w-full text-left"
        dangerouslySetInnerHTML={createMarkup()}
      />
    );
  };

  const renderRating = (
    rating: number,
    sizeClass: string,
    gapClass = "gap-1"
  ) => {
    const items = Array.from({ length: 5 }, (_, i) => {
      const src = i < rating ? ratingImg : fullRatingImg;
      return (
        <img
          key={i}
          src={src}
          alt="rating"
          className={`${sizeClass} select-none`}
        />
      );
    });
    return <div className={`flex items-center ${gapClass}`}>{items}</div>;
  };

  useEffect(() => {
    const partnerId = getCurrentPartnerId();
    if (!partnerId) {
      return;
    }

    const fetchPartner = async () => {
      try {
        const response = await partnerService.getById(partnerId);
        setPartnerData((response as any)?.output ?? response);
      } catch (error) {
        console.error("Error fetching partner profile", error);
      }
    };

    fetchPartner();
  }, []);

  const hasTrustPilotUrl =
    typeof partnerData?.trustPilotUrl === "string" &&
    partnerData.trustPilotUrl.trim().length > 0;

  const handleOpenTrustPilot = () => {
    if (!hasTrustPilotUrl) return;
    window.open(partnerData.trustPilotUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <ScrollToTop />
        <div className="relative  w-full h-[650px] overflow-hidden shadow-lg bg-[#01351F]">
          {/* Background Image */}
           <div
              className="inset-0 bg-cover bg-center bg-no-repeat w-full h-[100vh] bg-[#01351F] rounded-t-4xl"
              style={{
                      backgroundImage: `url(${getBackgroundImage()})`,
                      display: showVideoElement ? "none" : "block",
                  }}>
                    <div className="flex flex-col item-end justify-end ">
                      <div className="h-[40vh] "></div>
                      <div className="h-[60vh]"> 
                        <div className="h-[45vh] bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_90%)]"></div>
                        <div className="h-[15vh] bg-[#01351F]"></div>
                      </div>
                    </div>
                    </div>
  
           {/* Gradient Overlay */}
           <div className="absolute inset-0  z-5"
                style={{
                display: showVideoElement ? "none" : "block",
                }}
           />
  
  {/* Video Player */}
  {partnerData?.videoUrl && (
    <>
      <video
        ref={videoRef}
        className="inset-0 w-full h-full object-cover z-10"
        style={{
          display: showVideoElement ? "block" : "none",
        }}
        controls
      >
        <source src={partnerData.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="relative w-full h-full group">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <div className="flex items-center gap-12">
              {!isVideoPlaying ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick();
                  }}
                  className="text-white hover:scale-125 transition-transform pointer-events-auto"
                >
                  <FaPlayCircle className="h-16 w-16 md:h-20 md:w-20 drop-shadow-2xl" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePauseClick();
                  }}
                  className="text-white hover:scale-125 transition-transform pointer-events-auto"
                >
                  <FaPauseCircle className="h-16 w-16 md:h-20 md:w-20 drop-shadow-2xl" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  {/* Content Section */}
      <div className="relative z-30 bg-[#01351f] -mt-1">
        <div className="pt-4 md:pt-8 px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-[32px] md:text-4xl lg:text-[64px] font-[800] text-white mb-2">
              {partnerData?.businessName || "Business Name"}
            </h2>
            <p className="text-white font-[400] text-sm md:text-base lg:text-[18px] max-w-7xl mx-auto leading-normal px-4 md:px-0">
              {partnerData?.textField1 || "descriptionShort "}
            </p>
          </div>
        </div>
       
      </div>

       <div className="min-h-screen flex justify-center items-center p-8 bg-[#01351F]">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 max-w-7xl">
            {/* Trustpilot Section */}
            <div className="flex flex-col gap-6">
              <div className="md:w-[403px] w-full md:h-[859px] h-auto rounded-[10px] bg-white p-6 flex flex-col relative">
                <div className=" flex justify-center p-2">
                  <img
                    className="w-[130px] h-[32px]"
                    src={trustPilotLogo}
                    alt=""
                  />
                </div>
                <h3 className="text-[32px] font-[800] mb-5 text-center">
                  {t("supplierProfile.reviewsTitle")}
                </h3>
                <div className="space-y-10">
                  {reviews.length > 0 ? (
                    reviews.map((rev: any) => {
                      const r = Math.max(
                        0,
                        Math.min(5, Number(rev?.rating) || 0)
                      );
                      return (
                        <div key={rev.id} className="">
                          <div className="flex justify-center mb-3">
                            {renderRating(r, "w-[45px] h-[42px]", "gap-2")}
                          </div>
                          <p className="text-[14px] italic text-[#000000] leading-relaxed text-start font-[500] px-6 line-clamp-3">
                            ”{rev?.test}”
                          </p>
                          <p className="text-sm font-bold text-black mt-3 text-start px-6">
                            {rev?.customerName}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-semibold text-black mt-3">
                      Ingen anmeldelser endnu.
                    </p>
                  )}
                </div>

                <div className="left-[25%] flex justify-center pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={handleOpenTrustPilot}
                    className="absolute w-[202px] h-[66px] bg-[#95C11F] flex items-center justify-center gap-2 text-white rounded-[11px] px-4 text-[20px] font-semibold figtree cursor-pointer opacity-100 leading-tight -mt-[10px]"
                  >
                    <img
                      src={startImg}
                      alt="rating"
                      className="w-[33px] h-[33px] select-none"
                    />
                    Anmeld os på Trustpilot
                  </button>
                </div>
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto mt-[30px] rounded-[10px] flex justify-center items-center"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                }}
              >
                <div
                  className="relative flex flex-col items-center justify-center"
                  style={{
                    width: "300px",
                    height: "300px",
                    backgroundImage: `url(${circlePartner})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  <h2 className="text-white text-center text-[22px] font-semibold leading-tight">
                    Geografisk <br /> område
                  </h2>
                  <div className="max-w-[151px]">
                    <p className="text-white text-center text-[16px] pt-4 leading-tight">
                      {partnerData?.textField5}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col gap-6">
              <div className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] overflow-hidden">
                <img
                  src={partnerData?.imageUrl2}
                  alt={partnerData?.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
                }}
              >
                <img
                  src={servicesImg}
                  alt="Services"
                  className="w-[88px] h-[77px] select-none"
                />

                <h2 className="text-white text-[28px] font-[700] py-4">
                  Services
                </h2>

                {/* Updated Services Section */}
                <div className="text-white w-full text-left services-container">
                  {renderServicesContent()}
                </div>
              </div>

              <div className="bg-[#0E3E38] rounded-2xl p-6 md:w-[403px] w-full md:h-[432px] h-auto">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <img src="/src/assets/supplierProfile/gallery.png" alt="" />
                  <h3 className="text-3xl font-semibold text-white py-4">
                    Referencer
                  </h3>
                </div>
                <div className="text-white references-container">
                  {renderReferencesContent()}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[10px] md:w-[403px] w-full md:h-[432px] h-auto flex justify-center items-center">
                <div className="text-center">
                  <img
                    src={partnerData?.logoUrl || kabelLogoImg}
                    alt={partnerData?.businessName}
                    className="w-[177px] h-[164px] object-contain mx-auto"
                  />

                  <h2 className="font-extrabold text-[30px] leading-[76px] text-black text-center">
                    {partnerData?.businessName ||
                      partnerData?.fullName ||
                      "Kabel-specialisten"}
                  </h2>
                </div>
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] flex flex-col items-center gap-[10px] p-[53px_34px]"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                }}
              >
                <img
                  src={factsImg}
                  alt="Fakta"
                  className="w-[59px] h-[63px] select-none"
                />

                <h2 className="text-white text-[28px] font-[700] py-4">
                  Fakta
                </h2>

                <div className="text-white text-sm space-y-2 w-full">
                  {partnerData?.textField2 && (
                    <div
                      className="text-left"
                      dangerouslySetInnerHTML={{
                        __html: partnerData.textField2,
                      }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] overflow-hidden">
                <img
                  src={
                    partnerData?.imageUrl3 ||
                    "/src/assets/userImages/subcategoryDetailImg.png"
                  }
                  alt="Work"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </>
  );
}

export default PartnerProfileShortcut;










