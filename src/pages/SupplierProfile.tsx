import { useEffect, useRef, useState } from "react";
import supplierProfile from "../assets/supplierProfile/suppliier-profile-hero.png";
import heartIcon from "/src/assets/userImages/Lag_1.svg";
import share from "../assets/supplierProfile/share.png";
import chat from "../assets/supplierProfile/chat.png";
// import { Star } from "lucide-react";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../app/hooks";
import type { RootState } from "../app/store";
import shareModel from "/src/assets/userImages/shareModelImg.png";
import chatModel from "/src/assets/userImages/chatModelImg.svg";
import { favouritesService } from "../services/favourites.service";
import { conversationService } from "../services/conversation.service";
import { recommendationService } from "../services/recommendation.service";
import kabelLogoImg from "/src/assets/userImages/kabelLogoImg.png";
import {
  showRecommendationSuccessToast,
  showRecommendationErrorToast,
  showContactSuccessToast,
  showContactErrorToast,
  showFavouriteSuccessToast,
  showFavouriteErrorToast,
} from "../components/common/ToastBanner";
import { FaPlayCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { partnerService } from "../services/partner.service";
import ratingImg from "/src/assets/userImages/rating.png";
import fullRatingImg from "/src/assets/userImages/ratig2.png";
import trustPilotLogo from "/src/assets/userImages/boligmatchLogo2.png";
import startImg from "/src/assets/userImages/star.png";
import servicesImg from "/src/assets/supplierProfile/services.png";
import factsImg from "/src/assets/userImages/faktaLogo.svg";

const SupplierProfile = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  console.log("isScrolled", isScrolled);
  const { t } = useTranslation();
  const userData = useAppSelector((state: RootState) => state.auth.user);
  const [activeModal, setActiveModal] = useState<
    null | "recommend" | "contact"
  >(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);
  console.log("partnerData---->", partnerData);
  const [contactSubject, setContactSubject] = useState("");
  const [contactBody, setContactBody] = useState("");
  const [recommendEmail, setRecommendEmail] = useState("");
  const [recommendComment, setRecommendComment] = useState("");
  const navigate = useNavigate();
  const calledRef = useRef(false);
  const [isPartner, setIsPartner] = useState(false);
  console.log("isPartner---->", isPartner);

  useEffect(() => {
    const userData = localStorage.getItem("bm_user");
    const partnerData = localStorage.getItem("bm_partner");

    if (!partnerData && !userData) {
      navigate("/");
    }
  }, []);

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
        console.log("Partner Vigit");
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
    } catch {}
    return null;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load partner data from localStorage when component mounts
  useEffect(() => {
    const loadPartnerData = () => {
      try {
        const partnerStr = localStorage.getItem("bm_currentPartner");
        if (partnerStr) {
          const parsed = JSON.parse(partnerStr);
          // Handle both wrapped and unwrapped response formats
          const normalizedPartner = parsed?.output ?? parsed;
          setPartnerData(normalizedPartner);
          console.log("Loaded partner data:", normalizedPartner);
        }
      } catch (error) {
        console.error("Error loading partner data:", error);
      }
    };

    loadPartnerData();
  }, []);

  const handleToggleFavourite = async () => {
    try {
      setIsAddingToFavorites(true);
      const userId = getCurrentUserId();

      if (!userId) {
        showFavouriteErrorToast("User not found. Please log in again.");
        return;
      }

      const partnerId = getCurrentPartnerId();
      if (!partnerId) {
        showFavouriteErrorToast("Partner not loaded.");
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
            showFavouriteErrorToast("Favourite not found.");
            return;
          }
          await favouritesService.remove(match.id);
          showFavouriteSuccessToast("Removed from favourites successfully");
          setPartnerData((prev: any) => ({
            ...(prev || {}),
            isValidFavourite: "False",
          }));
        } catch (err) {
          console.error("Error removing favourite:", err);
          showFavouriteErrorToast(
            "Failed to remove from favourites. Please try again."
          );
        }
      } else {
        try {
          const payload = { userId, partnerId, isActive: true };
          await favouritesService.add(payload as any);
          showFavouriteSuccessToast("Added to favourites");
          setPartnerData((prev: any) => ({
            ...(prev || {}),
            isValidFavourite: "True",
          }));
        } catch (err) {
          console.error("Error adding favourite:", err);
          showFavouriteErrorToast(
            "Failed to add to favourites. Please try again."
          );
        }
      }
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleSendConversation = async () => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        showContactErrorToast("Partner not loaded.");
        return;
      }
      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const senderId = parsedUser?.userId ?? userData?.userId;

      if (!senderId) {
        showContactErrorToast("User not found. Please log in again.");
        return;
      }

      const payload = {
        messageSubject: contactSubject || "",
        messageContent: contactBody || "",
        senderId,
        receiverId: targetId,
        type: "partner",
        isActive: true,
      };

      await conversationService.add(payload);
      showContactSuccessToast("Message sent successfully");
      setActiveModal(null);
      setContactSubject("");
      setContactBody("");
    } catch (error) {
      console.error("Error sending message:", error);
      showContactErrorToast("Failed to send message. Please try again.");
    }
  };

  const handleSendRecommendation = async () => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        showRecommendationErrorToast("Fejl");
        return;
      }
      if (!recommendEmail) {
        showRecommendationErrorToast("Fejl");
        return;
      }

      // --- Start of added/updated logic ---
      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const userId = parsedUser?.userId ?? userData?.userId;

      if (!userId) {
        showRecommendationErrorToast("Fejl");
        return;
      }

      const payload = {
        patnerId: targetId,
        userId: userId,
        email: recommendEmail,
        description: recommendComment || "",
        isActive: true,
        recommendationKey: "",
      };

      await recommendationService.add(payload);
      showRecommendationSuccessToast("Recommandation Sent Succesfully!!");
      setActiveModal(null);
      setRecommendEmail("");
      setRecommendComment("");
    } catch (error) {
      console.error("Error sending recommendation:", error);
      showRecommendationErrorToast("Failed to Send Recommandation");
    }
  };

  const getBackgroundImage = () => {
    return partnerData?.imageUrl1 || partnerData?.thumbnail || supplierProfile;
  };

  const getServices = () => {
    if (!partnerData?.textField3) return [];
    const raw = String(partnerData.textField3 || "");
    const normalized = raw.replace(/<\/?br\s*\/?>(\r?\n)?/gi, "\n");
    return normalized
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .map((s: string) => s.replace(/^•\s*/, ""));
  };

  // Parse references from textField4
  const getReferences = () => {
    if (!partnerData?.textField4) return [];
    return partnerData.textField4
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  };

  // Helper: render a 5-icon rating row.
  // When rating === 5 -> show 4 x ratingImg + 1 x fullRatingImg as requested.
  // Otherwise: for i < rating use ratingImg else fullRatingImg.
  const renderRating = (
    rating: number,
    sizeClass: string,
    gapClass = "gap-1"
  ) => {
    const items = Array.from({ length: 5 }, (_, i) => {
      const src =
        rating === 5
          ? i < 4
            ? ratingImg
            : fullRatingImg
          : i < rating
          ? ratingImg
          : fullRatingImg;
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

  return (
    <>
      <div className="md:h-[100vh]">
        {!isVideoPlaying ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat md:h-[100vh] h-[368px]"
            style={{
              backgroundImage: `url(${getBackgroundImage()})`,
            }}
          ></div>
        ) : (
          <video
            className="absolute inset-0 w-full md:h-full h-[368px] object-cover"
            autoPlay
            controls
            onEnded={() => setIsVideoPlaying(false)}
          >
            <source src={partnerData?.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        <UserHeader />

        <div className="bg-[#01351f] pt-0">
          <div className="w-full mx-auto px-12 flex justify-center">
            {!isVideoPlaying && partnerData?.videoUrl && (
              <div className="absolute md:top-[50%] top-44 justify-center items-center text-white">
                <FaPlayCircle
                  onClick={() => setIsVideoPlaying(true)}
                  className="h-14 w-14 cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
            )}
            {/* <div className="absolute bottom-0">
            <img src={gradient} alt="" />
          </div> */}
            <div
              className="flex md:gap-10 gap-3 justify-center absolute md:bottom-0 w-full md:py-8 pb-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(1, 53, 31, 0) 0%, #01351F 100%)",
              }}
            >
              {!isPartner && (
                <>
                  <button
                    className="bg-[#91C73D] text-white md:px-6 md:py-3 px-[6px] py-[11px] md:rounded-lg rounded-[11px] flex items-center gap-[10px] cursor-pointer hover:bg-[#7fb02f] transition-colors md:text-[20px] text-[10px] md:leading-[100%] leading-[11px] font-[700] shadow-md w-[110px] h-[46px] md:w-auto md:h-auto opacity-100"
                    onClick={handleToggleFavourite}
                    disabled={isAddingToFavorites}
                  >
                    <img
                      src={heartIcon}
                      alt=""
                      className="w-[25px] h-[22px] md:w-auto md:h-auto"
                    />
                    {String(partnerData?.isValidFavourite) === "True"
                      ? t("supplierProfile.removeFromFavorites")
                      : t("supplierProfile.saveFavoriteButton")}
                  </button>
                  <button
                    className="bg-[#91C73D] text-white md:px-6 md:py-3 px-[6px] py-[11px] md:rounded-lg rounded-[11px] flex items-center gap-[10px] cursor-pointer hover:bg-[#7fb02f] transition-colors md:text-[20px] text-[10px] md:leading-[100%] leading-[11px] font-[700] shadow-md w-[110px] h-[46px] md:w-auto md:h-auto opacity-100"
                    onClick={() => setActiveModal("recommend")}
                  >
                    <img
                      src={share}
                      alt=""
                      className="w-[25px] h-[22px] md:w-auto md:h-auto"
                    />
                    {t("supplierProfile.recommendation")}
                  </button>
                  <button
                    className="bg-[#91C73D] text-white md:px-6 md:py-3 px-[6px] py-[11px] md:rounded-lg rounded-[11px] flex items-center gap-[10px] cursor-pointer hover:bg-[#7fb02f] transition-colors md:text-[20px] text-[10px] md:leading-[100%] leading-[11px] font-[700] shadow-md w-[110px] h-[46px] md:w-auto md:h-auto opacity-100"
                    onClick={() => setActiveModal("contact")}
                  >
                    <img
                      src={chat}
                      alt=""
                      className="w-[25px] h-[22px] md:w-auto md:h-auto"
                    />
                    {t("supplierProfile.conversation")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#01351f] pt-10">
          <h1 className="font-extrabold md:text-6xl text-[32px] text-center text-white py-10">
            {partnerData?.businessName || partnerData?.fullName || "Loading..."}
          </h1>
          <div className="max-w-6xl m-auto">
            <p className="text-white font-[400] md:text-[18px] text-[12px] text-center px-8">
              {partnerData?.descriptionShort || "Loading..."}
            </p>
          </div>
        </div>

        <div className="bg-[#012F2B] min-h-screen flex justify-center items-center p-8">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-6 max-w-7xl bg-[#012F2B]">
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
                  Anmeldelser
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
                          <p className="text-[14px] italic text-[#000000] leading-relaxed text-start font-[500] px-6">
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
                  <button className="absolute w-[202px] h-[66px] bg-[#95C11F] flex items-center justify-center gap-2 text-white rounded-[11px] px-4 text-[20px] font-semibold figtree cursor-pointer opacity-100 leading-tight -mt-[10px]">
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
                    backgroundImage:
                      "url('/src/assets/userImages/circlePartner.svg')",
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

                <ul className="text-white list-none space-y-2 w-full">
                  {getServices().length > 0 ? (
                    getServices().map((service: string, idx: number) => (
                      <p
                        key={idx}
                        className="relative pl-5 line-clamp-2 overflow-hidden"
                      >
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        {service}
                      </p>
                    ))
                  ) : (
                    <>
                      <li className="relative pl-5">
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        Løsning af fejl og fejlfinding
                      </li>
                      <li className="relative pl-5">
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        Intelligente hjemsystemer
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-[#0E3E38] rounded-2xl p-6 md:w-[403px] w-full md:h-[432px] h-auto">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <img src="/src/assets/supplierProfile/gallery.png" alt="" />
                  <h3 className="text-3xl font-semibold text-white py-4">
                    Referencer
                  </h3>
                </div>
                <div className="text-white">
                  {getReferences().length > 0 ? (
                    getReferences().map((ref: string, idx: number) => (
                      <p key={idx} className="mb-1">
                        {ref}
                      </p>
                    ))
                  ) : (
                    <p>{partnerData?.textField4}</p>
                  )}
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
                      dangerouslySetInnerHTML={{ __html: partnerData.textField2 }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="rounded-[10px] flex justify-center items-center overflow-hidden md:w-[403px] w-full md:h-[432px] h-auto">
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

        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setActiveModal(null)}
            />
            <div className="relative z-50 w-[320px] sm:w-[360px] md:w-[420px] bg-[#E5E7EB] rounded-[18px] shadow-xl p-6 border border-[#1F7A58]/10">
              <button
                className="absolute right-4 top-3 text-black text-xl cursor-pointer hover:text-gray-700"
                aria-label="Close"
                onClick={() => setActiveModal(null)}
              >
                ×
              </button>

              {activeModal === "recommend" && (
                <div className="flex flex-col items-stretch">
                  <div className="flex justify-center mb-4">
                    <img
                      src={shareModel}
                      alt="share"
                      className="w-[83px] h-[96px]"
                    />
                  </div>
                  <h3 className="text-center font-extrabold text-lg mb-1">
                    {t("supplierProfile.recommendModal.title")}
                  </h3>
                  <p className="text-center text-[13px] text-[#27323F] leading-snug mb-4">
                    {t("supplierProfile.recommendModal.description")}
                  </p>

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.recommendModal.email")}
                  </label>
                  <input
                    type="email"
                    placeholder=""
                    className="mb-3 w-full rounded-[10px] bg-white h-9 px-3 outline-none"
                    value={recommendEmail}
                    onChange={(e) => setRecommendEmail(e.target.value)}
                  />

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.recommendModal.comment")}
                  </label>
                  <textarea
                    placeholder=""
                    className="w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none"
                    value={recommendComment}
                    onChange={(e) => setRecommendComment(e.target.value)}
                  />

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleSendRecommendation}
                      className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg hover:bg-[#7fb02f] transition-colors"
                    >
                      {t("supplierProfile.recommendModal.send")}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "contact" && (
                <div className="flex flex-col items-stretch z-10">
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
                  </label>
                  <input
                    type="text"
                    className="mb-3 w-full rounded-[10px] bg-white h-9 px-3 outline-none"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  />

                  <label className="text-sm font-semibold mb-1">
                    {t("supplierProfile.contactModal.body")}
                  </label>
                  <textarea
                    className="w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none"
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                  />

                  <div className="flex justify-center mt-4 mb-6">
                    <button
                      onClick={handleSendConversation}
                      className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg hover:bg-[#7fb02f] transition-colors cursor-poi"
                    >
                      {t("supplierProfile.contactModal.send")}
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* <footer className="bg-[#01351f] text-white text-center p-4">
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
            Tørringvej 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
          </p>
        </div>
      </footer> */}
    </>
  );
};

export default SupplierProfile;
