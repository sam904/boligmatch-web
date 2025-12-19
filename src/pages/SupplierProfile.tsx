import { useEffect, useRef, useState } from "react";
import supplierProfile from "/src/assets/userImages/Group 37982 (3).svg";
import heartIcon from "/src/assets/userImages/Lag_1.svg";
import share from "../assets/supplierProfile/share.svg";
import chat from "../assets/supplierProfile/chat.svg";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../app/hooks";
import type { RootState } from "../app/store";
import shareModel from "/src/assets/userImages/shareModelImg.svg";
import chatModel from "/src/assets/userImages/chatModelImg.svg";
import { favouritesService } from "../services/favourites.service";
import { conversationService } from "../services/conversation.service";
import { recommendationService } from "../services/recommendation.service";
import kabelLogoImg from "/src/assets/userImages/kabelLogoImg.svg";
import circlePartner from "/src/assets/userImages/supplierCircle.svg";
import PlayButton from "/src/assets/userImages/PlayButton.svg"
import referancesImg from "/src/assets/supplierProfile/gallery.png"


import {
  showRecommendationErrorToast,
  showRecommendationSuccessToast,
  showContactSuccessToast,
  showContactErrorToast,
  showFavouriteSuccessToast,
  showFavouriteErrorToast,
} from "../components/common/ToastBanner";
import { FaPauseCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { partnerService } from "../services/partner.service";
import ratingImg from "/src/assets/userImages/rating.svg";
import fullRatingImg from "/src/assets/userImages/ratig2.svg";
import trustPilotLogo from "/src/assets/userImages/boligmatchLogo2.svg";
import startImg from "/src/assets/userImages/star.svg";
import servicesImg from "/src/assets/supplierProfile/services.svg";
import factsImg from "/src/assets/userImages/faktaLogo.svg";
import Footer from "./Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const recommendationSchema = z.object({
  name: z
    .string()
    .min(1, "validation.nameRequired"),
  email: z
    .string()
    .min(1, "validation.emailRequired")
    .email("validation.invalidEmail"),
  comment: z
    .string()
    .min(1, "validation.commentRequired")
    .max(500, "validation.commentMaxLength"),
});

const contactSchema = z.object({
  subject: z
    .string()
    .min(1, "validation.subjectRequired")
    .max(200, "validation.subjectMaxLength"),
  body: z.string().min(1, "validation.descriptionRequired"),
});

type RecommendationFormData = z.infer<typeof recommendationSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

const SupplierProfile = () => {
  const [_isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const userData = useAppSelector((state: RootState) => state.auth.user);
  const [activeModal, setActiveModal] = useState<
    null | "recommend" | "contact"
  >(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [modalRendered, setModalRendered] = useState<
    null | "recommend" | "contact"
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Add drag state
  const MODAL_TRANSITION_DURATION = 300;
  const navigate = useNavigate();
  const calledRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPartner, setIsPartner] = useState(false);
  const [showVideoElement, setShowVideoElement] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  console.log("showControls", showControls)

  // Recommendation form
  const {
    register: registerRecommendation,
    handleSubmit: handleRecommendationSubmit,
    formState: {
      errors: recommendationErrors,
      isSubmitting: isRecommendationSubmitting,
    },
    reset: resetRecommendation,
    trigger: triggerRecommendation,
    clearErrors: clearRecommendationErrors,
  } = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      comment: "",
    },
  });

  // Contact form
  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors, isSubmitting: isContactSubmitting },
    reset: resetContact,
    trigger: triggerContact,
    clearErrors: clearContactErrors,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  useEffect(() => {
    const userData = localStorage.getItem("bm_user");
    const partnerData = localStorage.getItem("bm_partner");

    if (!partnerData && !userData) {
      navigate("/");
    }
  }, []);

  // Add this useEffect for volume control
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

  // Add this useEffect for auto-hide controls
  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout>;
    let mouseLeaveTimeout: ReturnType<typeof setTimeout>;
    let isMouseOverControls = false;

    const showControlsTemporarily = () => {
      setShowControls(true);
      clearTimeout(hideTimeout);

      // Only hide if mouse is not over controls and video is playing
      if (!isMouseOverControls && isVideoPlaying) {
        hideTimeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    // Show controls on mouse move
    const handleMouseMove = () => {
      showControlsTemporarily();
    };

    // Track when mouse enters/leaves the controls area
    const handleMouseEnterControls = () => {
      isMouseOverControls = true;
      clearTimeout(hideTimeout);
      clearTimeout(mouseLeaveTimeout);
    };

    const handleMouseLeaveControls = () => {
      isMouseOverControls = false;
      // Small delay before starting hide timeout when leaving controls
      mouseLeaveTimeout = setTimeout(() => {
        if (isVideoPlaying) {
          hideTimeout = setTimeout(() => {
            setShowControls(false);
          }, 2000);
        }
      }, 500);
    };

    // Show controls on video play/pause
    if (videoRef.current) {
      videoRef.current.addEventListener('play', showControlsTemporarily);
      videoRef.current.addEventListener('pause', showControlsTemporarily);
    }

    window.addEventListener('mousemove', handleMouseMove);

    // Add event listeners to the controls container
    const controlsContainer = document.querySelector('.video-controls-container');
    if (controlsContainer) {
      controlsContainer.addEventListener('mouseenter', handleMouseEnterControls);
      controlsContainer.addEventListener('mouseleave', handleMouseLeaveControls);
    }

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(mouseLeaveTimeout);
      window.removeEventListener('mousemove', handleMouseMove);
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', showControlsTemporarily);
        videoRef.current.removeEventListener('pause', showControlsTemporarily);
      }
      if (controlsContainer) {
        controlsContainer.removeEventListener('mouseenter', handleMouseEnterControls);
        controlsContainer.removeEventListener('mouseleave', handleMouseLeaveControls);
      }
    };
  }, [isVideoPlaying]);


  const getCurrentUserId = (): number | null => {
    try {
      const userStr = localStorage.getItem("bm_user");
      if (!userStr) return null;
      const parsed = JSON.parse(userStr);
      const normalized = parsed?.output ?? parsed;
      const candidate = normalized?.userId ?? normalized?.id;
      const asNum = Number(candidate);
      return Number.isFinite(asNum) && asNum > 0 ? asNum : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const partnerData = localStorage.getItem("bm_partner");
    if (partnerData) {
      setIsPartner(true);
    }
  });

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const partnerId = getCurrentPartnerId();
    if (!partnerId) {
      console.log("No partner ID found");
    }
    const userId = userData?.userId;
    if (!userId) {
      console.log("No user ID found");
    }

    const addPartnerView = async () => {
      try {
        const payload = {
          id: 0,
          userId: userId,
          partnerId: partnerId,
          isActive: true,
        };
        const response = await partnerService.addPartnerPageVisit(payload);
        console.log("Partner view logged:", response);
      } catch (error) {
        console.error("Error logging partner view:", error);
      }
    };
    addPartnerView();
  }, []);

  const getCurrentPartnerId = (): number | null => {
    if (partnerData?.id) return partnerData.id;
    try {
      const str = localStorage.getItem("bm_currentPartner");
      if (str) {
        const parsed = JSON.parse(str);
        const normalized = parsed?.output ?? parsed;
        return normalized?.id ?? null;
      }
    } catch { }
    return null;
  };

  // Get locale from localStorage
  const getLocaleFromStorage = (): string => {
    try {
      const locale = localStorage.getItem("bm_lang");
      return locale || "da"; // Default to Danish if not found
    } catch {
      return "da"; // Default to Danish if error
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      // Give a small delay for the video element to be visible
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

  useEffect(() => {
    const loadPartnerData = async () => {
      try {
        const partnerStr = localStorage.getItem("bm_currentPartner");
        if (partnerStr) {
          const parsed = JSON.parse(partnerStr);
          // Handle both wrapped and unwrapped response formats
          const normalizedPartner = parsed?.output ?? parsed;

          console.log("Partner normalizedPartner:", normalizedPartner);
          setPartnerData(normalizedPartner);
          const response = await partnerService.getById(normalizedPartner.id);
          console.log("Partner Details:", response.output);
          if (response?.output) {
            //const parsed = JSON.parse(partnerStr);response.output
            setPartnerData(response?.output);
          }
        }
      } catch (error) {
        console.error("Error loading partner data:", error);
      }
    };

    loadPartnerData();
  }, []);

  // Modal visibility management
  useEffect(() => {
    let timeout: number | undefined;

    if (activeModal) {
      setModalRendered(activeModal);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsModalVisible(true))
      );
    } else if (modalRendered) {
      setIsModalVisible(false);
      timeout = window.setTimeout(
        () => setModalRendered(null),
        MODAL_TRANSITION_DURATION
      );
    }

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [activeModal, modalRendered]);

  // Add drag event listeners to form when modal is open
  useEffect(() => {
    if (!modalRendered) return;

    const formElement = document.querySelector("form");
    if (formElement) {
      const handleMouseDown = () => setIsDragging(true);
      const handleMouseUp = () => setIsDragging(false);

      formElement.addEventListener("mousedown", handleMouseDown);
      formElement.addEventListener("mouseup", handleMouseUp);

      return () => {
        formElement.removeEventListener("mousedown", handleMouseDown);
        formElement.removeEventListener("mouseup", handleMouseUp);
        setIsDragging(false);
      };
    }
  }, [modalRendered]);

  // Reset forms when modal closes
  const handleModalClose = () => {
    setActiveModal(null);
    clearRecommendationErrors();
    clearContactErrors();
    resetRecommendation();
    resetContact();
    setIsDragging(false);
  };

  const handleToggleFavourite = async () => {
    try {
      setIsAddingToFavorites(true);
      const userId = getCurrentUserId();

      if (!userId) {
        showFavouriteErrorToast(t("supplierProfile.toast.userNotLoggedIn"));
        return;
      }

      const partnerId = getCurrentPartnerId();
      if (!partnerId) {
        showFavouriteErrorToast(t("supplierProfile.toast.partnerNotLoaded"));
        return;
      }

      const isFav = String(partnerData?.isValidFavourite) === "True";

      if (isFav) {
        try {
          const all: any = await favouritesService.getAll();
          const list: any[] = Array.isArray(all)
            ? all
            : all?.items || all?.output || [];
          const match = (list || []).find(
            (f: any) =>
              Number(f?.userId) === Number(userId) &&
              Number(f?.partnerId) === Number(partnerId)
          );
          if (!match?.id) {
            showFavouriteErrorToast(t("supplierProfile.favoriteNotFound"));
            return;
          }
          await favouritesService.remove(match.id);
          showFavouriteSuccessToast(t("supplierProfile.removeFavoriteSuccess"));
          setPartnerData((prev: any) => ({
            ...(prev || {}),
            isValidFavourite: "False",
          }));
        } catch (err) {
          console.error("Error removing favourite:", err);
          showFavouriteErrorToast(t("supplierProfile.removeFavoriteError"));
        }
      } else {
        try {
          const payload = { userId, partnerId, isActive: true };
          await favouritesService.add(payload as any);
          showFavouriteSuccessToast(t("supplierProfile.addFavoriteSuccess"));
          setPartnerData((prev: any) => ({
            ...(prev || {}),
            isValidFavourite: "True",
          }));
        } catch (err) {
          console.error("Error adding favourite:", err);
          showFavouriteErrorToast(t("supplierProfile.addFavoriteError"));
        }
      }
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleSendConversation = async (data: ContactFormData) => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        showContactErrorToast(t("supplierProfile.toast.partnerNotLoaded"));
        return;
      }

      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const senderId = parsedUser?.userId ?? userData?.userId;

      if (!senderId) {
        showContactErrorToast(t("supplierProfile.contactUserNotFound"));
        return;
      }

      const locale = getLocaleFromStorage();

      const payload = {
        messageSubject: data.subject,
        messageContent: data.body,
        senderId,
        receiverId: targetId,
        type: "partner",
        isActive: true,
        locale: locale,
      };

      await conversationService.add(payload);
      showContactSuccessToast(t("supplierProfile.toast.contactSuccess"));
      setActiveModal(null);
      resetContact();
    } catch (error) {
      console.error("Error sending message:", error);
      showContactErrorToast(t("supplierProfile.contactSendError"));
    }
  };

  const handleSendRecommendation = async (data: RecommendationFormData) => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        showRecommendationErrorToast(
          t("supplierProfile.toast.recommendPartnerMissing")
        );
        return;
      }

      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const userId = parsedUser?.userId ?? userData?.userId;

      if (!userId) {
        showRecommendationErrorToast(
          t("supplierProfile.toast.recommendUserMissing")
        );
        return;
      }

      // Get locale from localStorage
      const locale = getLocaleFromStorage();

      const payload = {
        patnerId: targetId,
        userId: userId,
        name: data.name,
        email: data.email,
        description: data.comment || "",
        isActive: true,
        recommendationKey: "",
        locale: locale,
      };

      await recommendationService.add(payload);
      showRecommendationSuccessToast(
        t("supplierProfile.toast.recommendSuccess")
      );
      setActiveModal(null);
      resetRecommendation();
    } catch (error) {
      console.error("Error sending recommendation:", error);
      showRecommendationErrorToast(t("supplierProfile.recommendationError"));
    }
  };

  const getBackgroundImage = () => {
    return partnerData?.imageUrl1 || partnerData?.thumbnail || supplierProfile;
  };

  const hasTrustPilotUrl =
    typeof partnerData?.trustPilotUrl === "string" &&
    partnerData.trustPilotUrl.trim().length > 0;

  const handleOpenTrustPilot = () => {
    if (!hasTrustPilotUrl) return;
    window.open(partnerData.trustPilotUrl, "_blank", "noopener,noreferrer");
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

  const reviews: any[] = Array.isArray(partnerData?.testImo)
    ? partnerData.testImo.filter((r: any) => r && r.isDisplayed)
    : [];

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

  const renderServicesContent = () => {
    if (!partnerData?.textField3) {
      return (
        <ul className="services-list">
          <li className="service-item">
            <span className="bullet"></span>
            {t("supplierProfile.servicesFallback.fixingIssues")}
          </li>
          <li className="service-item">
            <span className="bullet-point"></span>
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
        className="services-html-content"
        dangerouslySetInnerHTML={createMarkup()}
      />
    );
  };

  // Handle overlay click for modal - only close if not dragging
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!isDragging && e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  return (
    <>
      <div className="md:h-[100vh] bg-[#01351f]">
        {/* Always render background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:h-[100vh] h-[350px]"
          style={{
            backgroundImage: `url(${getBackgroundImage()})`,
            display: showVideoElement ? "none" : "block",
          }}
        ></div>

        {/* Always render video element but control visibility */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full md:h-full h-[368px] object-cover"
          style={{
            display: showVideoElement ? "block" : "none",
          }}
        >
          <source src={partnerData?.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Custom video controls - show on hover only */}
        <div className="absolute inset-0 z-40  video-controls-container">
          {/* Hover area - full video size */}
          <div className="relative w-full h-full group">
            {/* Controls container - positioned higher up */}
            <div className={`md:absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-auto `}>

              {/* Main play/pause button - centered */}
              <div className=" flex md:h-[100vh] h-[120px] md:items-end md:justify-center md:mt-0 mt-10   md:w-full gap-6 transform translate-y-12 ">
                <div className="flex md:items-end gap-12">
                  {/* Play / Pause button */}
                  {!isVideoPlaying && partnerData?.videoUrl ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                      }}
                      className="self-center text-white hover:scale-125 transition-transform bg-black/50 rounded-full p-2 cursor-pointer"
                      onMouseEnter={() => setShowControls(true)}
                    >
                      <img
                        src={PlayButton}
                        alt="Play"
                        className="h-15 w-15 drop-shadow-2xl"
                      />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePauseClick();
                      }}
                      className={`self-center text-white hover:scale-125 transition-all duration-300 bg-black/50 rounded-full p-2 ${isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                      onMouseEnter={() => setShowControls(true)}
                    >
                      <FaPauseCircle className="h-15 w-15 drop-shadow-2xl" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom controls bar - ALWAYS show when hovered */}
              {isVideoPlaying && (
                <div
                  className="absolute md:bottom-60 left-0 right-0  p-4 pt-8 md:opacity-0  md:group-hover:opacity-100 transition-opacity duration-300"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={(e) => {
                    // Don't hide immediately when leaving controls
                    e.stopPropagation();
                  }}
                >
                  <div className="flex items-center justify-between  mx-auto w-full px-4">

                    {/* Left side: Play/Pause */}
                    <div
                      className="flex items-center gap-4"
                      onMouseEnter={() => setShowControls(true)}
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
                        className="text-white hover:scale-110 transition-transform"
                      >
                        {isVideoPlaying ? (
                          <FaPauseCircle className="h-8 w-8" />
                        ) : (
                          <img
                            src={PlayButton}
                            alt="Play"
                            className="h-8 w-8"
                          />
                        )}
                      </button>

                      {/* Current time / Duration */}
                      <div className="text-white text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    {/* Right side: Additional controls */}
                    <div
                      className="flex items-center gap-4"
                      onMouseEnter={() => setShowControls(true)}
                    >
                      {/* Volume control */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            videoRef.current.muted = !videoRef.current.muted;
                          }
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        {videoRef.current?.muted ? (
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
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
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
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
                        className="text-white hover:scale-110 transition-transform ml-2"
                      >
                        <IoClose className="h-7 w-7" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="md:bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] md:h-[368px] w-full mt-20" >

              </div>
              <div className="md:bg-[#01351f] w-full md:h-16"></div>
              <div className=" md:bg-[#01351f] bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] pt-0 w-full">
                <div className="w-full mx-auto px-4 md:px-12 flex justify-center items-end max-w-7xl">
                  <div className="flex md:gap-4 gap-1.5 justify-center md:bottom-0 w-full pb-0 z-40">
                    {!isPartner && (
                      <>
                        {/* Favorite Button */}
                        <button
                          onClick={handleToggleFavourite}
                          disabled={isAddingToFavorites}
                          type="button"
                          className={`
    bg-[#95c11f] text-white
    flex items-center justify-center gap-2
    rounded-xl
    ${String(partnerData?.isValidFavourite) === "True" ? "px-3" : "px-5"}
    sm:px-6 md:px-5
    shadow-xl sm:shadow-md
    hover:opacity-90 transition
    cursor-pointer
    w-[190px]
    min-h-[42px] md:min-h-[55px]
    figtree
    disabled:opacity-60
  `}
                        >
                          <img
                            src={heartIcon}
                            alt="Favorite"
                            className="w-[22px] h-[22px] md:w-[30px] md:h-[30px] flex-shrink-0"
                          />

                          <span
                            className="
      font-[700]
      text-[10px] md:text-[14px] lg:text-[20px]
      leading-[1.2]
      text-center
      whitespace-normal
    "
                          >
                            {String(partnerData?.isValidFavourite) === "True"
                              ? t("supplierProfile.removeFromFavorites")
                              : t("supplierProfile.saveFavoriteButton")}
                          </span>
                        </button>


                        {/* Recommend Button */}
                        <button
                          onClick={() => setActiveModal("recommend")}
                          type="button"
                          className="
    bg-[#95c11f] text-white
    flex items-center justify-center gap-2
    rounded-xl
    px-5 sm:px-6 md:px-5
    shadow-xl sm:shadow-md
    hover:opacity-90 transition
    cursor-pointer
    w-[190px]
    min-h-[42px] md:min-h-[55px]
    figtree
  "
                        >
                          <img
                            src={share}
                            alt="Recommend"
                            className="w-[22px] h-[22px] md:w-[30px] md:h-[30px] flex-shrink-0"
                          />

                          <span
                            className="
      font-[700]
      text-[10px] md:text-[14px] lg:text-[20px]
      leading-[1.2]
      text-center
      whitespace-normal
    "
                          >
                            {t("supplierProfile.recommendation")}
                          </span>
                        </button>


                        {/* Contact Button */}
                        <button
                          onClick={() => setActiveModal("contact")}
                          type="button"
                          className="
    bg-[#95c11f] text-white
    flex items-center justify-center gap-2
    rounded-xl
    px-5 sm:px-6 md:px-5
    shadow-xl sm:shadow-md
    hover:opacity-90 transition
    cursor-pointer
    w-[190px]
    min-h-[42px] md:min-h-[55px]
    figtree
  "
                        >
                          <img
                            src={chat}
                            alt="Contact"
                            className="w-[22px] h-[22px] md:w-[30px] md:h-[30px] flex-shrink-0"
                          />

                          <span
                            className="
      font-[700]
      text-[10px] md:text-[14px] lg:text-[20px]
      leading-[1.2]
      text-center
      whitespace-normal
    "
                          >
                            {t("supplierProfile.conversation")}
                          </span>
                        </button>

                      </>
                    )}
                  </div>

                </div>
              </div>
              <div className={`${!isPartner && 'bg-[#01351f] md:bg-[#01351f] '} md:bg-[#01351f] bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] w-full pt-[27px] md:mt-[0px]`}>
                <h1 className="font-extrabold md:text-6xl text-[32px] text-center text-white md:py-5 py-0">
                  {partnerData?.businessName || partnerData?.fullName || "Loading..."}
                </h1>
              </div>

            </div>
          </div>
        </div>

        <UserHeader />


        <div className="bg-[#01351f]">
          <div className="max-w-6xl m-auto px-4 md:px-8 py-4 md:py-8">
            <p className="text-white font-[400] md:text-[18px] text-[14px] text-left md:text-center px-4 md:px-8 leading-relaxed">
              {partnerData?.textField1 || "Loading..."}
            </p>
          </div>
        </div>

        <div className="bg-[#01351f] min-h-screen flex justify-center items-center p-4 md:p-8">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-6 max-w-7xl w-full bg-[#01351f]">
            {/* Trustpilot Section */}
            <div className="flex flex-col gap-6">
              <div
                className={`md:w-[403px] w-full ${hasTrustPilotUrl ? "md:h-[859px]" : "md:h-[890px]"
                  } h-auto rounded-[10px] bg-white p-6 flex flex-col relative shadow-xl`}
              >
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
                          <p className="text-[14px] italic text-[#000000] leading-relaxed text-start font-[500] px-6 line-clamp-5">
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

                {hasTrustPilotUrl && (
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
                      {t("supplierProfile.reviewUsOnTrustpilot")}
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`md:w-[403px] w-full md:h-[432px] h-auto ${hasTrustPilotUrl ? "mt-[30px]" : "mt-[0px]"
                  } rounded-[10px] flex justify-center items-center p-4 md:p-0 shadow-xl`}
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                }}
              >
                <div className="relative flex items-center justify-center">
                  <img
                    src={circlePartner}
                    alt="Geografisk område"
                    className="w-[300px] h-[300px] object-contain"
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

            {/* Middle Section */}
            <div className="flex flex-col gap-6">
              <div className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] overflow-hidden shadow-xl">
                <img
                  src={partnerData?.imageUrl2}
                  alt={partnerData?.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start shadow-xl"
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

                <h2 className="text-white text-[28px] font-[700] py-3.5">
                  {t("supplierProfile.servicesTitle")}
                </h2>

                <div className="text-white w-full text-left services-container leading-[31px]">
                  {renderServicesContent()}
                </div>
              </div>
              {/* className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start" */}
              <div className="rounded-2xl pt-[53px] px-8 pb-8 md:w-[403px] w-full md:h-[432px] h-auto shadow-xl"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
                }}
              >
                <div className="flex flex-col items-center gap-2 mb-2">
                  <img src={referancesImg} alt="" className="w-[88px] h-[59px] select-none" />
                  <h3 className="text-3xl font-semibold text-white py-4">
                    {t("supplierProfile.referencesTitle")}
                  </h3>
                </div>
                <div className="text-white references-container leading-[31px] ">
                  {renderReferencesContent()}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[10px] md:w-[403px] w-full md:h-[432px] h-auto flex justify-center items-center p-6 md:p-8 shadow-xl">
                <div className="text-center">
                  <img
                    src={partnerData?.logoUrl || kabelLogoImg}
                    alt={partnerData?.businessName}
                    className="w-[177px] h-[164px] object-contain mx-auto"
                  />
                </div>
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] flex flex-col items-center gap-[10px] p-[53px_34px] shadow-xl"
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

                <h2 className="text-white text-[28px] font-[700] font- py-4">
                  {t("supplierProfile.factsTitle")}
                </h2>

                <div className="text-white text-[16px] space-y-2 w-full text-left leading-[31px]">
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

              <div className="rounded-[10px] flex justify-center items-center overflow-hidden md:w-[403px] w-full md:h-[432px] h-auto shadow-xl">
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

        {/* Modals */}
        {modalRendered && (
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isModalVisible ? "opacity-100" : "opacity-0"
              }`}
            style={{
              pointerEvents: isModalVisible ? "auto" : "none",
              // Allow scrolling in the background - FIX
              overflowY: "auto",
              padding: "20px 0",
            }}
          >
            {/* Background overlay with improved click handler */}
            <div
              className="absolute inset-0 bg-black/50 cursor-pointer transition-opacity duration-300"
              style={{ opacity: isModalVisible ? 1 : 0.5 }}
              onClick={handleOverlayClick}
            />

            <div
              className={`relative z-50 w-[320px] sm:w-[360px] md:w-[420px] bg-[#E5E7EB] rounded-[18px] shadow-xl p-6 border border-gray-400/10 transform transition-all duration-300 ease-out my-auto ${isModalVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
                }`}
              onClick={(e) => e.stopPropagation()}
              // Prevent form closing on drag
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                setIsDragging(false);
              }}
              onMouseLeave={() => setIsDragging(false)}
            >
              <button
                className="absolute right-4 top-4 text-black text-xl cursor-pointer hover:text-gray-700 z-[99999]"
                aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModalClose();
                }}
              >
                <IoClose className="w-[36px] h-[36px] cursor-pointer" />
              </button>

              {modalRendered === "recommend" && (
                <form
                  onSubmit={handleRecommendationSubmit(
                    handleSendRecommendation
                  )}
                  className="flex flex-col items-stretch"
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center mb-4">
                    <img
                      src={shareModel}
                      alt="share"
                      className="w-[63px] h-[76px]"
                    />
                  </div>
                  <h3 className="text-center font-extrabold text-lg mb-1">
                    {t("supplierProfile.recommendModal.title")}
                  </h3>
                  <p className="text-center text-[13px] text-[#27323F] leading-snug mb-4">
                    {t("supplierProfile.recommendModal.description")}
                  </p>

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.recommendModal.name")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      t("supplierProfile.recommendModal.namePlaceholder") ||
                      "Enter name"
                    }
                    className={`mb-1 w-full rounded-[10px] bg-white h-9 px-3 outline-none ${recommendationErrors.name ? "border border-red-500" : ""
                      }`}
                    {...registerRecommendation("name", {
                      onBlur: async () => {
                        await triggerRecommendation("name");
                      },
                    })}
                  />
                  {recommendationErrors.name && (
                    <p className="text-red-500 text-xs mb-2">
                      {t(recommendationErrors.name.message || "")}
                    </p>
                  )}

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.recommendModal.email")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder={
                      t("supplierProfile.recommendModal.emailPlaceholder") ||
                      "Enter email address"
                    }
                    className={`mb-1 w-full rounded-[10px] bg-white h-9 px-3 outline-none ${recommendationErrors.email ? "border border-red-500" : ""
                      }`}
                    {...registerRecommendation("email", {
                      onBlur: async () => {
                        await triggerRecommendation("email");
                      },
                    })}
                  />
                  {recommendationErrors.email && (
                    <p className="text-red-500 text-xs mb-2">
                      {t(recommendationErrors.email.message || "")}
                    </p>
                  )}

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.recommendModal.comment")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    placeholder={
                      t("supplierProfile.recommendModal.commentPlaceholder") ||
                      "Enter your comment"
                    }
                    className={`w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none ${recommendationErrors.comment
                      ? "border border-red-500"
                      : ""
                      }`}
                    {...registerRecommendation("comment", {
                      onBlur: async () => {
                        await triggerRecommendation("comment");
                      },
                    })}
                  />
                  {recommendationErrors.comment && (
                    <p className="text-red-500 text-xs mb-2">
                      {t(recommendationErrors.comment.message || "")}
                    </p>
                  )}

                  <div className="flex justify-center mt-4">
                    <button
                      type="submit"
                      disabled={isRecommendationSubmitting}
                      className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg hover:bg-[#7fb02f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRecommendationSubmitting
                        ? t("common.sending") || "Sending..."
                        : t("supplierProfile.recommendModal.send") || "Send"}
                    </button>
                  </div>
                </form>
              )}

              {modalRendered === "contact" && (
                <form
                  onSubmit={handleContactSubmit(handleSendConversation)}
                  className="flex flex-col items-stretch z-10"
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center mb-4">
                    <img
                      src={chatModel}
                      alt="chat"
                      className="w-[112px] h-[89px]"
                    />
                  </div>
                  <h3 className="text-center font-extrabold text-lg mb-1">
                    {t("supplierProfile.contactModal.title")}
                  </h3>
                  <p className="text-center text-[13px] text-[#27323F] leading-snug mb-4">
                    {t("supplierProfile.contactModal.description")}
                  </p>

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.contactModal.subject")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    className={`mb-1 w-full rounded-[10px] bg-white h-9 px-3 outline-none ${contactErrors.subject ? "border border-red-500" : ""
                      }`}
                    placeholder={
                      t("supplierProfile.contactModal.subjectPlaceholder") ||
                      "Enter subject"
                    }
                    {...registerContact("subject", {
                      onBlur: async () => {
                        await triggerContact("subject");
                      },
                    })}
                  />
                  {contactErrors.subject && (
                    <p className="text-red-500 text-xs mb-2">
                      {t(contactErrors.subject.message || "")}
                    </p>
                  )}

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.contactModal.body")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    className={`w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none ${contactErrors.body ? "border border-red-500" : ""
                      }`}
                    placeholder={
                      t("supplierProfile.contactModal.bodyPlaceholder") ||
                      "Enter your message"
                    }
                    {...registerContact("body", {
                      onBlur: async () => {
                        await triggerContact("body");
                      },
                    })}
                  />
                  {contactErrors.body && (
                    <p className="text-red-500 text-xs mb-2">
                      {t(contactErrors.body.message || "")}
                    </p>
                  )}

                  <div className="flex justify-center mt-4 mb-6">
                    <button
                      type="submit"
                      disabled={isContactSubmitting}
                      className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg hover:bg-[#7fb02f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isContactSubmitting
                        ? t("common.sending") || "Sending..."
                        : t("supplierProfile.contactModal.send") || "Send"}
                    </button>
                  </div>

                  <div className="text-center text-[12px] text-[#27323F]">
                    <p className="mb-1 font-semibold">
                      {t("supplierProfile.contactModal.contactInfo")}
                    </p>
                    <p className="font-extrabold">
                      {partnerData?.businessName}
                    </p>
                    <p>{partnerData?.address}</p>
                    <p>
                      Tlf. {partnerData?.mobileNo || "56 34 12 67"}{" "}
                      {partnerData?.cvr > 0 ? `, CVR ${partnerData.cvr}` : ""}
                    </p>
                    <p>{partnerData?.email}</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupplierProfile;
