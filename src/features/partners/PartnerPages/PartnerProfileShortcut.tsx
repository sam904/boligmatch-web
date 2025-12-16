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
import circlePartner from "/src/assets/userImages/supplierCircle.png";
import ScrollToTop from "../../../components/common/ScrollToTop";
import { FaPauseCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import PlayButton from "/src/assets/userImages/PlayButton.svg";
import referancesImg from "/src/assets/supplierProfile/gallery.png"

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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

  // Volume control effect
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.volume = volume;
      videoElement.muted = isMuted;

      const handleVolumeChange = () => {
        setVolume(videoElement.volume);
        setIsMuted(videoElement.muted);
      };

      videoElement.addEventListener('volumechange', handleVolumeChange);

      return () => {
        videoElement.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [volume, isMuted]);

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

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
          <p>{t("supplierProfile.noReferencesAvailable")}</p>
        </div>
      );
    }

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
            {t("supplierProfile.servicesFallback.fixingIssues")}
          </li>
          <li className="relative pl-5">
            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
            {t("supplierProfile.servicesFallback.smartHome")}
          </li>
        </ul>
      );
    }

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
      {/* <div className="relative w-full md:h-[650px] h-[400px] overflow-hidden shadow-lg bg-[#01351F]"> */}
      {/* className="inset-0 bg-cover bg-center bg-no-repeat w-full md:h-[100vh] h-[400px] bg-[#01351F] rounded-t-4xl" */}
      <div className="relative w-full md:h-[683px] h-[400px] overflow-hidden shadow-lg bg-[#01351F]">
        <div
          className="inset-0 bg-cover bg-center bg-no-repeat w-full md:h-[683px] h-[400px] bg-[#01351F] rounded-t-4xl"
          style={{
            backgroundImage: `url(${getBackgroundImage()})`,
            display: showVideoElement ? "none" : "block",
          }}>
          <div className="flex flex-col item-end justify-end">
            <div className="h-[40vh]"></div>
            <div className="h-[60vh]">
              <div className="h-[45vh] bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)]"></div>
              <div className="h-[15vh] bg-[#01351F]"></div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full md:h-[683px] h-[400px] object-cover rounded-t-4xl"
          style={{
            display: showVideoElement ? "block" : "none",
          }}
          playsInline
        >
          <source src={partnerData?.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Custom video controls - Exactly like SupplierProfile */}
        <div className="absolute inset-0 z-40 pointer-events-none video-controls-container">
          <div className="relative w-full h-full group">
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-auto`}>

              {/* Main play/pause button - centered */}
              <div className="flex md:h-[683px] h-[400px] items-end justify-center w-full gap-6 md:transform md:-translate-y-12 -translate-y-8">
                <div className="flex items-end gap-12">
                  {/* Play / Pause button */}
                  {!isVideoPlaying && partnerData?.videoUrl ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                      }}
                      className="text-white hover:scale-125 active:scale-110 transition-transform bg-black/50 rounded-full p-2 cursor-pointer touch-manipulation"
                    >
                      <img
                        src={PlayButton}
                        alt="Play"
                        className="md:h-15 md:w-15 h-12 w-12 drop-shadow-2xl"
                      />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePauseClick();
                      }}
                      className={`text-white hover:scale-125 active:scale-110 transition-all duration-300 bg-black/50 rounded-full p-2 cursor-pointer touch-manipulation ${isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                    >
                      <FaPauseCircle className="md:h-15 md:w-15 h-12 w-12 drop-shadow-2xl" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom controls bar */}
              {isVideoPlaying && (
                <div
                  className="absolute md:bottom-60 bottom-20 left-0 right-0 p-2 md:p-4 pt-4 md:pt-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="flex items-center justify-between mx-auto w-full px-2 md:px-4">

                    {/* Left side: Play/Pause */}
                    <div
                      className="flex items-center gap-2 md:gap-4"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isVideoPlaying) {
                            handlePauseClick();
                          } else {
                            handlePlayClick();
                          }
                        }}
                        className="text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
                      >
                        {isVideoPlaying ? (
                          <FaPauseCircle className="h-6 w-6 md:h-8 md:w-8" />
                        ) : (
                          <img
                            src={PlayButton}
                            alt="Play"
                            className="h-6 w-6 md:h-8 md:w-8"
                          />
                        )}
                      </button>

                      {/* Current time / Duration */}
                      <div className="text-white text-xs md:text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    {/* Right side: Additional controls */}
                    <div
                      className="flex items-center gap-2 md:gap-4"
                    >
                      {/* Volume control */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            videoRef.current.muted = !videoRef.current.muted;
                          }
                        }}
                        className="text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
                      >
                        {videoRef.current?.muted ? (
                          <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>

                      {/* Fullscreen button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              videoRef.current.requestFullscreen();
                            }
                          }
                        }}
                        className="text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
                      >
                        <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>

                      {/* Close video button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseClick();
                          setShowVideoElement(false);
                        }}
                        className="text-white hover:scale-110 active:scale-95 transition-transform ml-1 md:ml-2 cursor-pointer touch-manipulation"
                      >
                        <IoClose className="h-6 w-6 md:h-7 md:w-7" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient overlay at bottom */}
              <div className="bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] h-[80px] w-full"></div>

              {/* Bottom section with partner info */}
              <div className="bg-[#043428] pt-0 w-full">
                <div className="w-full mx-auto  flex justify-center items-end">
                  <div className="bg-[#01351F] w-full">
                    <h1 className="w-full font-extrabold md:text-6xl text-[24px] md:text-[32px] text-center text-white py-3 md:py-5">
                      {partnerData?.businessName || partnerData?.fullName || "Loading..."}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-30 bg-[#01351f] -mt-1">
        <div className="pt-4 md:pt-8 px-4 md:px-8">
          <div className="text-center">
            <p className="text-white font-[400] text-sm md:text-base lg:text-[18px] max-w-7xl mx-auto leading-normal md:px-0">
              {partnerData?.textField1 || "descriptionShort "}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex justify-center items-center md:p-8 p-4 bg-[#01351F]">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 max-w-7xl">
          <div className="flex flex-col gap-6">
            <div className="md:w-[403px] w-full md:h-[859px] h-auto rounded-[10px] bg-white p-6 flex flex-col relative">
              <div className=" flex justify-center items-end">
                <img
                  className="w-[130px] h-[32px]"
                  src={trustPilotLogo}
                  alt=""
                />
              </div>
              <h3 className="text-[32px] font-[800] mb-5 text-center leading-6.5">
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
                    {t("supplierProfile.noReviewsYet")}
                  </p>
                )}
              </div>

              <div className="left-[25%] flex justify-center pt-2 mt-auto">
                <button
                  type="button"
                  onClick={handleOpenTrustPilot}
                  className="absolute w-[160px] md:w-[202px] h-[50px] md:h-[66px] bg-[#95C11F] flex items-center justify-center gap-1.5 md:gap-2 text-white rounded-[11px] px-3 md:px-4 text-base md:text-[20px] font-semibold figtree cursor-pointer opacity-100 leading-tight -mt-[10px]"
                >
                  <img
                    src={startImg}
                    alt="rating"
                    className="w-6 h-6 md:w-[33px] md:h-[33px] select-none"
                  />
                  {t("supplierProfile.reviewUsOnTrustpilot")}
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
              <div className="relative flex items-center justify-center">
                <img
                  src={circlePartner}
                  alt="Geografisk område"
                  className="w-[300px] h-[300px] object-contain p-4 md:p-4"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-white text-center text-[30px] font-semibold leading-tight">
                    Geografisk <br /> område
                  </h2>
                  <div className="max-w-[151px] mt-4">
                    <p className="text-white text-center text-[16px] leading-tight">
                      {partnerData?.textField5}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                {t("supplierProfile.servicesTitle")}
              </h2>

              <div className="text-white w-full text-left services-container leading-[31px]">
                {renderServicesContent()}
              </div>
            </div>

            <div className="rounded-2xl p-8 md:w-[403px] w-full md:h-[432px] h-auto"
              style={{
                background:
                  "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
              }}
            >
              <div className="flex flex-col items-center gap-2 mb-2">
                <img src={referancesImg} alt="" />
                <h3 className="text-3xl font-semibold text-white py-4">
                  {t("supplierProfile.referencesTitle")}
                </h3>
              </div>
              <div className="text-white references-container leading-[31px]">
                {renderReferencesContent()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[10px] md:w-[403px] w-full md:h-[432px] h-auto flex justify-center items-center">
              <div className="text-center p-4">
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
                className="w-[88px] h-[77px] select-none"
              />
              <h2 className="text-white text-[28px] font-[700] py-4">
                {t("supplierProfile.factsTitle")}
              </h2>
              <div className="text-white text-sm space-y-2 w-full text-left leading-[31px]">
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