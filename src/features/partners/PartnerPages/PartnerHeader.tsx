import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userLogo from "/src/assets/userImages/boligmatchLogo.png";
import userHeader from "/src/assets/userImages/userHeader.png";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/hooks";
import { tokenStorage } from "../../../lib/storage";
import { RxHamburgerMenu } from "react-icons/rx";
import homeIcon from "/src/assets/userImages/home.png";
import myBoligmatchIcon from "/src/assets/userImages/my-boligmatch.png";
import manageProfileIcon from "/src/assets/userImages/gear.png";
// import partnerPitchIcon from "/src/assets/userImages/partnerPitch.png";
import docsIcon from "/src/assets/userImages/docsIcon.png"
import becomePartnerIcon from "/src/assets/userImages/becomePartner.png";
import aboutBoligmatchIcon from "/src/assets/userImages/aboutBoligmatch.png";
import termsConditionIcon from "/src/assets/userImages/termsAndCondi.png";
import signOutIcon from "/src/assets/userImages/signOut.png";

function PartnerHeader({ fullHeight = true }: { fullHeight?: boolean }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"user" | "partner">("user");
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  console.log("showLangDropdown", showLangDropdown);
  const [showSidebar, setShowSidebar] = useState(false);
  const { i18n, t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  console.log("isMobile", isMobile);

  const partnerData = useAppSelector((state) => state.auth.user);
  console.log("partnerData", partnerData);

  const currentLang = i18n.language || "en";
  console.log("currentLang", currentLang);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header className={`${fullHeight ? "h-[100vh]" : "h-20"} relative`}>
        <div
          className={`fixed top-0 left-0 right-0 h-20 md:px-12 px-4 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="">
              <img
                onClick={() => navigate("/")}
                className={`duration-300 ${
                  isScrolled ? "h-10" : "h-12"
                } cursor-pointer`}
                src={userLogo}
                alt=""
              />
            </div>

            <div className="flex items-center md:gap-4 gap-2">
              {partnerData ? (
                <div className="relative">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <span className="text-white text-sm font-medium">
                      {partnerData.firstName} {partnerData.lastName}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  className="p-2 text-white transition-colors"
                  onClick={() => setIsChoiceModalOpen(true)}
                >
                  <img
                    src={userHeader}
                    alt=""
                    className={`duration-300 ${
                      isScrolled ? "h-8" : "h-10"
                    } cursor-pointer`}
                  />
                </button>
              )}

              <button
                onClick={() => {
                  setShowLangDropdown(false);
                  setShowSidebar(true);
                }}
                className="p-2 text-white transition-colors"
              >
                <RxHamburgerMenu
                  size={isScrolled ? 22 : 28}
                  className="duration-300 cursor-pointer"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300 opacity-100"
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-64 sm:w-80 bg-[#01351f] shadow-2xl transform transition-all duration-500 ease-out translate-x-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {/* Partner Profile in Sidebar */}
                  {partnerData ? (
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-medium">
                        {/* {partnerData.firstName} {partnerData.lastName} */}
                        {t("sidebar.logInPartner")}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="p-2 text-white transition-colors"
                      onClick={() => {
                        setShowSidebar(false);
                        setIsChoiceModalOpen(true);
                      }}
                    >
                      {t("sidebar.notLogIn")}
                    </button>
                  )}
                </div>
                {/* Close Button at far right */}
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
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
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-6">
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <img
                        src={homeIcon}
                        alt=""
                        className="w-[30px] h-[30px]"
                      />
                      {t("sidebar.home")}
                    </span>
                  </button>
                  {partnerData && (
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={myBoligmatchIcon}
                          alt=""
                          className="w-[30px] h-[30px]"
                        />
                        {t("sidebar.mitBoligmatch")}
                      </span>
                    </button>
                  )}
                  {partnerData && (
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        // navigate("");
                      }}
                      className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={manageProfileIcon}
                          alt=""
                          className="w-[30px] h-[30px]"
                        />
                        {t("sidebar.manageProfile")}
                      </span>
                    </button>
                  )}
                  {partnerData && (
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate("/partner/documents");
                      }}
                      className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={docsIcon}
                          alt=""
                          className="w-[30px] h-[30px]"
                        />
                        Document
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/partner");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <img
                        src={becomePartnerIcon}
                        alt=""
                        className="w-[30px] h-[30px]"
                      />
                      {t("sidebar.becomePartner")}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/about");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <img
                        src={aboutBoligmatchIcon}
                        alt=""
                        className="w-[30px] h-[30px]"
                      />
                      {t("sidebar.about")}
                    </span>
                  </button>
                  {/* <button
                    onClick={() => {
                      setShowSidebar(false);
                      // navigate("");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5z"
                        />
                      </svg>
                      {t("sidebar.privacyPolicy")}
                    </span>
                  </button> */}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/terms");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <img
                        src={termsConditionIcon}
                        alt=""
                        className="w-[30px] h-[30px]"
                      />
                      {t("sidebar.terms")}
                    </span>
                  </button>
                </nav>
              </div>
              <div className="mt-auto p-6 border-t border-white/10">
                {partnerData ? (
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      tokenStorage.clearAll();
                      localStorage.removeItem("bm_currentPartner");
                      localStorage.removeItem("bm_subcategories");
                      localStorage.removeItem("bm_currentSubCategory");
                      localStorage.removeItem("bm_partner");
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-[#95C11F]/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <img
                      src={signOutIcon}
                      alt=""
                      className="w-[30px] h-[30px]"
                    />
                    <span className="font-medium text-[#95C11F]">
                      {t("sidebar.signOut")}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      setIsChoiceModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginChoiceModal
        open={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelect={(role) => {
          setIsChoiceModalOpen(false);
          if (role === "user") {
            setModalRole("user");
            setIsModalOpen(true);
          } else {
            setModalRole("partner");
            setIsModalOpen(true);
          }
        }}
      />

      {isModalOpen && (
        <UserModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          roleTarget={modalRole}
        />
      )}
    </>
  );
}

export default PartnerHeader;
