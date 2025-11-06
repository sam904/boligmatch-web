import { useEffect, useRef, useState } from "react";
import supplierProfile from "../assets/supplierProfile/suppliier-profile-hero.png";
import heartIcon from "/src/assets/userImages/Lag_1.svg";
import share from "../assets/supplierProfile/share.png";
import chat from "../assets/supplierProfile/chat.png";
import { Star } from "lucide-react";
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
import { toast } from "react-toastify";
import { FaPlayCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { partnerService } from "../services/partner.service";
// import gradient from "/src/assets/userImages/gradient.svg";

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

  useEffect(() => {
    const userData = localStorage.getItem("bm_user");
    if (!userData) {
      navigate("/");
    }
  }, []);

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

  const handleAddToFavorites = async () => {
    try {
      setIsAddingToFavorites(true);
      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const userId = parsedUser?.userId ?? userData?.userId;

      if (!userId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const partnerId = getCurrentPartnerId();
      if (!partnerId) {
        toast.error("Partner not loaded.");
        return;
      }

      const payload = {
        userId: userId,
        partnerId: partnerId,
        isActive: true,
      };

      await favouritesService.add(payload);
      toast.success("Added to favourites");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("Failed to add to favourites. Please try again.");
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  const handleSendConversation = async () => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        toast.error("Partner not loaded.");
        return;
      }
      const userStr = localStorage.getItem("bm_user");
      const parsedUser = userStr ? JSON.parse(userStr) : null;
      const senderId = parsedUser?.userId ?? userData?.userId;

      if (!senderId) {
        toast.error("User not found. Please log in again.");
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
      toast.success("Message sent successfully");
      setActiveModal(null);
      setContactSubject("");
      setContactBody("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleSendRecommendation = async () => {
    try {
      const targetId = getCurrentPartnerId();
      if (!targetId) {
        toast.error("Partner not loaded.");
        return;
      }
      if (!recommendEmail) {
        toast.error("Please enter recipient email.");
        return;
      }

      const payload = {
        patnerId: targetId,
        email: recommendEmail,
        description: recommendComment || "",
        isActive: true,
      };

      await recommendationService.add(payload);
      toast.success("Recommendation sent successfully");
      setActiveModal(null);
      setRecommendEmail("");
      setRecommendComment("");
    } catch (error) {
      console.error("Error sending recommendation:", error);
      toast.error("Failed to send recommendation. Please try again.");
    }
  };

  // Get background image - priority: imageUrl1 > thumbnail > default
  const getBackgroundImage = () => {
    return partnerData?.imageUrl1 || partnerData?.thumbnail || supplierProfile;
  };

  // Parse services from textField3
  const getServices = () => {
    if (!partnerData?.textField3) return [];
    return partnerData.textField3
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

  return (
    <div className="h-[100vh]">
      {!isVideoPlaying ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBackgroundImage()})`,
          }}
        ></div>
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          controls
          onEnded={() => setIsVideoPlaying(false)}
        >
          <source src={partnerData?.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <UserHeader />
      <div className="bg-[#043428] pt-0">
        <div className="w-full mx-auto px-12 flex justify-center">
          {!isVideoPlaying && partnerData?.videoUrl && (
            <div className="absolute top-[50%] justify-center items-center text-white">
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
            className="flex gap-10 justify-center absolute bottom-0 w-full py-8 pb-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(4, 52, 40, 0) 0%, #043428 100%)",
            }}
          >
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#7fb02f] transition-colors"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={handleAddToFavorites}
              disabled={isAddingToFavorites}
            >
              <img src={heartIcon} alt="" />
              {t("supplierProfile.saveFavoriteButton")}
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#7fb02f] transition-colors"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={() => setActiveModal("recommend")}
            >
              <img src={share} alt="" />
              {t("supplierProfile.recommendation")}
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#7fb02f] transition-colors"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={() => setActiveModal("contact")}
            >
              <img src={chat} alt="" />
              {t("supplierProfile.conversation")}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#043428] pt-10">
        <h1 className="font-extrabold text-6xl text-center text-white py-10">
          {partnerData?.businessName || partnerData?.fullName || "Loading..."}
        </h1>
        <div className="max-w-6xl m-auto">
          <p className="text-white font-[400] text-[18px] text-center">
            {partnerData?.descriptionShort || "Loading..."}
          </p>
        </div>
      </div>

      <div className="bg-[#012F2B] min-h-screen flex justify-center items-center p-8">
        <div className="grid grid-cols-3 gap-6 max-w-7xl bg-[#012F2B]">
          {/* Trustpilot Section */}
          <div className="flex flex-col gap-6">
            <div className="w-[403px] h-[881px] rounded-[10px] bg-white p-6 flex flex-col">
              <h3 className="text-3xl font-semibold mb-5 text-center">
                Trustpilot
              </h3>

              {/* Stars Row */}
              <div className="flex justify-center items-center gap-1 mb-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="text-[#95C11F] fill-[#95C11F] w-[52px] h-[52px]"
                    />
                  ))}
                <Star className="text-gray-400 fill-gray-400 w-[52px] h-[52px]" />
              </div>

              <p className="text-md font-semibold text-black mb-4 text-center">
                Fremragende / 273 anmeldelser
              </p>

              <p className="text-7xl font-bold text-center mb-6">4.0</p>

              {/* Progress Bars */}
              <div className="space-y-2 mb-4">
                {[5, 4, 3, 2, 1].map((num) => (
                  <div key={num} className="flex items-center gap-3 py-1">
                    <span className="text-sm w-20">{num} stjerner</span>
                    <div className="w-[300px] h-3 bg-[#D9D9D9] rounded-full overflow-hidden">
                      <div className="h-3 bg-[#95C11F] rounded-full w-2/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Section Header */}
              <div className="rounded-xl p-3 mt-auto">
                <p className="text-xl font-bold text-center pb-7">
                  Anmeldelser
                </p>

                {/* Reviewer */}
                <div className="flex items-center space-x-3">
                  <div className="bg-[#9ACD32] text-white font-bold rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm">
                    NR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-black leading-tight">
                      Niels Rasmussen
                    </span>
                    <span className="text-sm text-gray-600">
                      April 21, 2025
                    </span>
                  </div>
                </div>
              </div>

              {/* Stars under the review */}
              <div className="flex items-center gap-1 mt-4 mb-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="text-[#95C11F] fill-[#95C11F] w-6 h-6"
                    />
                  ))}
                <Star className="text-gray-400 fill-gray-400 w-6 h-6" />
              </div>

              <p className="text-sm font-semibold text-black mt-3">
                Hil idundae pelibus. Ulluptas vollace stibus eaquam quam
                dernatus am accatur, sam dolo essint aut utatur? Qui dit
                aboribusam, comniam quo dendi conse sapiet quame provitem iunt.
                Ulpa nia pra nobitis maionsed quos aborupta sam, voluptaerum
                sequi conem fugitibus, volum fugiatibus exceseres a sam, accae
              </p>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button className="mt-4 w-[170px] bg-[#91C73D] flex items-center justify-center gap-2 text-white rounded-lg px-4 py-1 text-sm font-semibold hover:bg-[#91C73D]/80">
                  <Star className="w-5 h-5" />
                  Anmeld os på Trustpilot
                </button>
              </div>
            </div>

            <div
              className="w-[403px] h-[432px] rounded-[10px] flex justify-center items-center"
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

                <p className="text-white text-center text-[16px] pt-2 leading-tight">
                  {partnerData?.textField5}
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex flex-col gap-6">
            <div className="w-[403px] h-[432px] rounded-[10px] overflow-hidden">
              <img
                src={partnerData?.imageUrl2}
                alt={partnerData?.businessName}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="w-[403px] h-[432px] rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start"
              style={{
                background:
                  "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
              }}
            >
              <img
                src="/src/assets/supplierProfile/services.png"
                alt="Services"
                className="w-[88px] h-[77px] select-none"
              />

              <h2 className="text-white text-[28px] font-[700] py-4">
                Services
              </h2>

              <ul className="text-white list-none space-y-2 w-full">
                {getServices().length > 0 ? (
                  getServices().map((service: string, idx: number) => (
                    <li key={idx} className="relative pl-5">
                      <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                      {service}
                    </li>
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

            <div className="bg-[#0E3E38] rounded-2xl p-6 aspect-square">
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
            <div className="bg-white rounded-[10px] w-[403px] h-[432px] flex justify-center items-center">
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
              className="w-[403px] h-[432px] rounded-[10px] flex flex-col items-center gap-[10px] p-[53px_34px]"
              style={{
                background:
                  "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
              }}
            >
              <img
                src="/src/assets/userImages/faktaLogo.svg"
                alt="Fakta"
                className="w-[59px] h-[63px] select-none"
              />

              <h2 className="text-white text-[28px] font-[700] py-4">Fakta</h2>

              <ul className="text-white text-sm list-none space-y-2 w-full">
                {partnerData?.textField2 && (
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    {partnerData.textField2}
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl flex justify-center items-center overflow-hidden">
              <img
                src={
                  partnerData?.imageUrl3 ||
                  "/src/assets/userImages/subcategoryDetailImg.png"
                }
                alt="Work"
                className="w-full h-auto object-cover"
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
                    className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg hover:bg-[#7fb02f] transition-colors"
                  >
                    {t("supplierProfile.contactModal.send")}
                  </button>
                </div>

                <div className="text-center text-[12px] text-[#27323F]">
                  <p className="mb-1 font-semibold">
                    {t("supplierProfile.contactModal.contactInfo")}
                  </p>
                  <p className="font-extrabold">{partnerData?.businessName}</p>
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
  );
};

export default SupplierProfile;
