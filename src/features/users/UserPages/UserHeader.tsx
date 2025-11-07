import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userLogo from "/src/assets/userImages/boligmatchLogo.png";
import userHeader from "/src/assets/userImages/userHeader.png";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import PartnerModal from "../../../components/common/PartnerModal";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/hooks";
import { tokenStorage } from "../../../lib/storage";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaGear } from "react-icons/fa6";

function UserHeader() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  console.log(showLangDropdown);
  const [showSidebar, setShowSidebar] = useState(false);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const { i18n, t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  console.log(isMobile)

  const userData = useAppSelector((state) => state.auth.user);

  const currentLang = i18n.language || "en";
  console.log(currentLang)

  // Check for partner data in localStorage
  useEffect(() => {
    const checkPartnerData = () => {
      try {
        const storedPartner = localStorage.getItem("bm_partner");
        if (storedPartner) {
          const partner = JSON.parse(storedPartner);
          setPartnerData(partner);
        }
      } catch (error) {
        console.error("Error parsing partner data:", error);
      }
    };

    checkPartnerData();

    // Optional: Listen for storage changes
    window.addEventListener("storage", checkPartnerData);
    return () => window.removeEventListener("storage", checkPartnerData);
  }, []);

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

  // Determine what to display: partner or user
  const isPartner = !!partnerData && (partnerData as any).roleName === "Partner";
  const displayName = isPartner
    ? partnerData?.firstName
    : userData
      ? `${userData.firstName} ${userData.lastName}`
      : null;

  return (
    <>
      <header className="md:h-[100vh] h-[366px] relative">
        <div
          className={`fixed top-0 left-0 right-0 h-20 md:px-12 px-4 z-50 transition-colors duration-300 ${isScrolled ? "bg-[#06351E]" : "bg-transparent"
            }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="">
              <img
                onClick={() => navigate("/")}
                className={`duration-300 ${isScrolled ? "h-10" : "h-12"
                  } cursor-pointer`}
                src={userLogo}
                alt=""
              />
            </div>

            <div className="flex items-center md:gap-4 gap-2">
              {displayName ? (
                <div className="relative">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <span className="text-white text-sm font-medium">
                      {displayName}
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
                    className={`duration-300 ${isScrolled ? "h-8" : "h-10"
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
          <div className="absolute right-0 top-0 h-full w-64 md:w-80 bg-[#01351f] shadow-2xl transform transition-all duration-500 ease-out translate-x-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {/* Partner/User Profile in Sidebar */}
                  {isPartner ? (
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-medium">
                        {t("sidebar.logInPartner")}
                      </span>
                    </div>
                  ) : userData ? (
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-medium">
                        {t("sidebar.logINUser")}
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
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      {t("sidebar.home")}
                    </span>
                  </button>
                  {displayName && (
                    <>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/profile");
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
                              d="M12 4.5l6 3v6c0 3.59-2.69 6.74-6 7.5-3.31-.76-6-3.91-6-7.5v-6l6-3z"
                            />
                          </svg>
                          {t("sidebar.mitBoligmatch")}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          // navigate("");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FaGear className="w-4 h-4" />
                          {t("sidebar.manageProfile")}
                        </span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/partner/statistics");
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
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
                          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                        />
                      </svg>
                      {t("sidebar.about")}
                    </span>
                  </button>
                  <button
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
                  </button>
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/terms");
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("sidebar.terms")}
                    </span>
                  </button>
                </nav>
              </div>
              <div className="mt-auto p-6 border-t border-white/10">
                {displayName ? (
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
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-9V4"
                      />
                    </svg>
                    <span className="font-medium text-red-400">
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
            setIsModalOpen(true);
          } else {
            setIsPartnerModalOpen(true);
          }
        }}
      />

      {isModalOpen && (
        <UserModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
      {isPartnerModalOpen && (
        <PartnerModal
          open={isPartnerModalOpen}
          onClose={() => setIsPartnerModalOpen(false)}
        />
      )}
    </>
  );
}

export default UserHeader;