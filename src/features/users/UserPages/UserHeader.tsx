import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import userLogo from "/src/assets/userImages/boligmatchLogo.svg";
import leftArrow from "/src/assets/userImages/arrow-left.svg";
import userHeader from "/src/assets/userImages/userHeader.svg";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/hooks";
import { tokenStorage } from "../../../lib/storage";
import { RxHamburgerMenu } from "react-icons/rx";
import homeIcon from "/src/assets/userImages/home.svg";
import myBoligmatchIcon from "/src/assets/userImages/my-boligmatch.svg";
import manageProfileIcon from "/src/assets/userImages/gear.svg";
// import partnerPitchIcon from "/src/assets/userImages/partnerPitch.png"
import docsIcon from "/src/assets/userImages/docsIcon.svg";
import becomePartnerIcon from "/src/assets/userImages/becomePartner.svg";
import aboutBoligmatchIcon from "/src/assets/userImages/aboutBoligmatch.svg";
import termsConditionIcon from "/src/assets/userImages/termsAndCondi.svg";
import privacyPolicyIcon from "/src/assets/userImages/Privacypolicy.svg";
import signOutIcon from "/src/assets/userImages/signOut.svg";

function UserHeader({
  // fullHeight = true,
  showBackButton = true,
}: {
  fullHeight?: boolean;
  showBackButton?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"user" | "partner">("user");
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarRendered, setSidebarRendered] = useState(false);
  const [sidebarTransitionActive, setSidebarTransitionActive] = useState(false);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [userLocalData, setUserLocalData] = useState<any | null>(null);
  const { i18n, t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  console.log(isMobile);

  const userData = useAppSelector((state) => state.auth.user);

  const currentLang = i18n.language || "en";
  console.log(currentLang);

  // Check for partner data in localStorage
  useEffect(() => {
    const checkPartnerData = () => {
      try {
        const storedPartner = localStorage.getItem("bm_partner");
        if (storedPartner) {
          const partner = JSON.parse(storedPartner);
          setPartnerData(partner);
          console.log("partner", partner);
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

  // Check for user data in localStorage
  useEffect(() => {
    try {
      const storedUser =
        typeof window !== "undefined" ? localStorage.getItem("bm_user") : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserLocalData(parsed);
        console.log("parsed", parsed);
      }
    } catch (error) {
      console.error("Error parsing bm_user from localStorage:", error);
    }
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

  useEffect(() => {
    let frame = 0;
    let timeout: number | undefined;

    if (showSidebar) {
      setSidebarRendered(true);
      setSidebarTransitionActive(false);
      frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setSidebarTransitionActive(true))
      );
    } else if (sidebarRendered) {
      setSidebarTransitionActive(false);
      timeout = window.setTimeout(() => setSidebarRendered(false), 500);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [showSidebar, sidebarRendered]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bm_lang");
      // Always default to Danish - if no language is saved or if English is saved, set to Danish
      if (!saved || saved === "en") {
        i18n.changeLanguage("da");
        localStorage.setItem("bm_lang", "da");
      } else if (saved && saved !== i18n.language) {
        i18n.changeLanguage(saved);
      }
    } catch { /* empty */ }
  }, [i18n]);

  // Add this function to determine user type
  const getUserType = () => {
    // Check for partner-specific data first
    const partnerToken = localStorage.getItem("bm_access");
    const storedPartner = localStorage.getItem("bm_partner");

    // If we have partner data or we're on a partner route
    if (
      storedPartner ||
      (partnerToken && window.location.pathname.includes("/partner/"))
    ) {
      return "partner";
    }

    // Check for user data
    const userToken = localStorage.getItem("bm_access");
    const storedUser = localStorage.getItem("bm_user");

    if (
      storedUser ||
      (userToken && !window.location.pathname.includes("/partner/"))
    ) {
      return "user";
    }

    return null;
  };

  // Then use it in your component
  const userType = getUserType();
  const isPartner = userType === "partner";
  const isUser = userType === "user";

  // Prioritize partner if exists, otherwise use user data (from localStorage or Redux)
  const activeUser = !isPartner ? userLocalData || userData : null;

  const displayName = isPartner
    ? partnerData?.firstName
      ? `${partnerData?.firstName} ${partnerData?.lastName}`
      : `${partnerData?.businessName}`
    : activeUser
    ? `${activeUser.firstName} ${activeUser.lastName}`
    : null;

  return (
    <>
      <header
        className="h-16"
      >
        <div
          className={`fixed top-0 left-0 right-0 h-20 md:px-12 px-4 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex flex-col items-start gap-1">
              <img
                onClick={() => {
                  if (isPartner) {
                    navigate("/partner/statistics");
                  } else if (isUser) {
                    navigate("/user/profile");
                  } else {
                    navigate("/");
                  }
                }}
                className={`duration-300 ${
                  isScrolled ? "h-10" : "h-11"
                } cursor-pointer`}
                src={userLogo}
                alt=""
              />
            </div>

            <div className="flex items-center md:gap-4 gap-2">
              {!isMobile && (
                <>
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
                      className="p-2 text-white transition-all duration-300 ease-out hover:scale-110 active:scale-95 hover:opacity-80"
                      onClick={() => setIsChoiceModalOpen(true)}
                      style={{ willChange: "transform" }}
                    >
                      <img
                        src={userHeader}
                        alt=""
                        className={`duration-300 transition-all ease-out ${
                          isScrolled ? "h-8" : "h-10"
                        } cursor-pointer`}
                      />
                    </button>
                  )}
                </>
              )}
              {/* Language Dropdown - Commented out */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown((v) => !v)}
                  className="px-2 py-1 rounded-md bg-white/10 text-white text-xs md:text-sm font-semibold hover:bg-white/20 transition-colors cursor-pointer min-w-[44px] text-center"
                >
                  {currentLang?.toUpperCase?.() || "EN"}
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg z-50 overflow-hidden cursor-pointer">
                    <button
                      onClick={() => {
                        i18n.changeLanguage("da");
                        localStorage.setItem("bm_lang", "da");
                        setShowLangDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      Dansk
                    </button>
                    <button
                      onClick={() => {
                        i18n.changeLanguage("en");
                        localStorage.setItem("bm_lang", "en");
                        setShowLangDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  // setShowLangDropdown(false);
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
          {showBackButton && (
            <span>
              <button
                type="button"
                onClick={() => {
                  // Smart back: use browser back if history exists, otherwise redirect to "/"
                  const hasHistory = window.history.length > 1;
                  const hasState = location.state !== null && location.state !== undefined;
                  const hasLocationKey = location.key !== 'default' && location.key !== null;
                  const notOnHome = location.pathname !== '/';
                  
                  const canGoBack = hasHistory && (hasState || hasLocationKey || (notOnHome && window.history.length > 2));
                  
                  if (canGoBack) {
                    navigate(-1);
                  } else {
                    navigate('/', { replace: true });
                  }
                }}
                className="inline-flex items-center justify-center mt-0 p-1 transition-colors cursor-pointer"
              >
                <img
                  src={leftArrow}
                  alt="Tilbage"
                  className="md:w-[51px] md:h-[51px] w-[40px] h-[40px]"
                />
              </button>
            </span>
          )}
        </div>
      </header>

      {/* Sidebar */}
      {sidebarRendered && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              sidebarTransitionActive ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar */}
          <div
            className={`absolute right-0 top-0 h-full w-full md:w-80 bg-[#01351f] shadow-2xl transform transition-all duration-500 ease-out ${
              sidebarTransitionActive ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {/* Partner/User Profile in Sidebar */}
                  {displayName ? (
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {displayName}
                      </span>
                      <span className="text-white text-xs opacity-70">
                        {isPartner
                          ? t("sidebar.logInPartner")
                          : t("sidebar.logINUser")}
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
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
                      <img
                        src={homeIcon}
                        alt=""
                        className="w-[30px] h-[30px]"
                      />
                      {isPartner || isUser ? t("sidebar.frontPage") : t("sidebar.home")}
                    </span>
                  </button>
                  {/* Show user-only links when logged in as user */}
                  {displayName && (
                    <>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          if (isPartner) {
                            navigate("/partner/statistics");
                          } else if (isUser) {
                            navigate("/user/profile");
                          } else {
                            navigate("/");
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={myBoligmatchIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {isPartner ? t("sidebar.partnerDashboard") : t("sidebar.mitBoligmatch")}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          if (isPartner) {
                            navigate("/partner/manage-profile");
                          } else if (isUser) {
                            navigate("/user/manage-profile");
                          } else {
                            // Show login modal or navigate to home
                            setIsChoiceModalOpen(true);
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={manageProfileIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {t("sidebar.manageProfile")}
                        </span>
                      </button>
                      {/* <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/partner/statistics");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <img src={partnerPitchIcon} alt="" className="w-[30px] h-[30px]" />
                          Partner Pitch
                        </span>
                      </button> */}
                    </>
                  )}
                  {/* Show partner-only links when logged in as partner */}
                  {displayName && isPartner && (
                    <>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/partner/documents");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={docsIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {t("admin.partners.Documents")}
                        </span>
                      </button>
                      {/* <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/partner/manage-profile");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={manageProfileIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {t("sidebar.manageProfile")}
                        </span>
                      </button> */}
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/becomePartner");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
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
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
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
                      navigate("/privacy");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
                      <img
                        src={privacyPolicyIcon}
                        alt=""
                        className="w-[30px] h-[30px] filter brightness-0 invert"
                      />
                      {t("sidebar.privacyPolicy")}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/terms");
                    }}
                    className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 cursor-pointer">
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
                {displayName ? (
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      tokenStorage.clearAll();
                      localStorage.removeItem("bm_currentPartner");
                      localStorage.removeItem("bm_subcategories");
                      localStorage.removeItem("bm_currentSubCategory");
                      localStorage.removeItem("bm_partner");
                      localStorage.removeItem("bm_user");
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-[#95C11F]/20 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
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
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
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
                    <span className="font-medium">{t("auth.signIn")}</span>
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

export default UserHeader;
