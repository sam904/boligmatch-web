import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userLogo from "/src/assets/userImages/boligmatchLogo.png";
import userHeader from "/src/assets/userImages/userHeader.png";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import { useTranslation } from "react-i18next";
import { tokenStorage } from "../../../lib/storage";
import { RxHamburgerMenu } from "react-icons/rx";
import homeIcon from "/src/assets/userImages/home.png";
import myBoligmatchIcon from "/src/assets/userImages/my-boligmatch.png";
// import partnerPitchIcon from "/src/assets/userImages/partnerPitch.png";
import docsIcon from "/src/assets/userImages/docsIcon.png";
import becomePartnerIcon from "/src/assets/userImages/becomePartner.png";
import aboutBoligmatchIcon from "/src/assets/userImages/aboutBoligmatch.png";
import termsConditionIcon from "/src/assets/userImages/termsAndCondi.png";
import signOutIcon from "/src/assets/userImages/signOut.png";
import leftArrow from "/src/assets/userImages/arrow-left.svg";
import manageProfileIcon from "/src/assets/userImages/gear.png";

const resolveDisplayName = (entity?: any): string | null => {
  if (!entity) return null;

  const first =
    typeof entity.firstName === "string" ? entity.firstName.trim() : "";
  const last =
    typeof entity.lastName === "string" ? entity.lastName.trim() : "";

  if (first || last) {
    return [first, last].filter(Boolean).join(" ");
  }

  const fallbackFields = [
    entity.fullName,
    entity.businessName,
    entity.companyName,
    entity.contactName,
    entity.name,
    entity.email,
    entity.userName,
  ];

  for (const field of fallbackFields) {
    if (typeof field === "string" && field.trim().length > 0) {
      return field.trim();
    }
  }

  return null;
};

function PartnerHeader({ fullHeight = true }: { fullHeight?: boolean }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"user" | "partner">("user");
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  console.log("showLangDropdown", showLangDropdown);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarRendered, setSidebarRendered] = useState(false);
  const [sidebarTransitionActive, setSidebarTransitionActive] = useState(false);
  const { i18n, t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  console.log("isMobile", isMobile);

  // const partnerData = useAppSelector((state) => state.auth.user);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [partnerLocalData, setPartnerLocalData] = useState<any | null>(null);
  const [userLocalData, setUserLocalData] = useState<any | null>(null);
  console.log("partnerData", partnerData);

  const currentLang = i18n.language || "en";
  console.log("currentLang", currentLang);
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
    // Load partner from localStorage (bm_partner) so header/sidebar stay logged-in after reload
    try {
      const storedPartner =
        typeof window !== "undefined"
          ? localStorage.getItem("bm_partner")
          : null;
      if (storedPartner) {
        const parsed = JSON.parse(storedPartner);
        setPartnerLocalData(parsed);
      }
    } catch (error) {
      console.error("Error parsing bm_partner from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    // Load end-user from localStorage (bm_user) for correct label on partner pages
    try {
      const storedUser =
        typeof window !== "undefined" ? localStorage.getItem("bm_user") : null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserLocalData(parsed);
      }
    } catch (error) {
      console.error("Error parsing bm_user from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bm_lang");
      if (saved && saved !== i18n.language) {
        i18n.changeLanguage(saved);
      }
    } catch {}
  }, []);

  const activePartner =
    partnerLocalData && !userLocalData ? partnerLocalData : null;
  console.log("activePartner", activePartner);
  const activeUser = !activePartner ? userLocalData || partnerData : null;

  const partnerDisplayName = resolveDisplayName(activePartner);
  const userDisplayName = resolveDisplayName(activeUser);
  const displayName = partnerDisplayName ?? userDisplayName;

  return (
    <>
      <header className={`${fullHeight ? "h-[100vh]" : "h-20"} relative`}>
        <div
          className={`fixed top-0 left-0 right-0 h-20 md:px-12 px-4 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex flex-col items-start gap-1">
              <img
                onClick={() => {
                  if (activePartner) {
                    navigate("/partner/statistics");
                  } else if (activeUser) {
                    navigate("/user/profile");
                  } else {
                    navigate("/");
                  }
                }}
                className={`duration-300 ${
                  isScrolled ? "h-10" : "h-12"
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
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center mt-0 p-1 transition-colors cursor-pointer"
            >
              <img
                src={leftArrow}
                alt="Tilbage"
                className="w-[51px] h-[51px]"
              />
            </button>
          </div>
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
                  {/* Partner/User Profile in Sidebar for partner pages */}
                  {displayName ? (
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {displayName}
                      </span>
                      <span className="text-white text-xs opacity-70">
                        {activePartner
                          ? t("sidebar.logInPartner")
                          : t("sidebar.logINUser")}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="p-2 text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:opacity-80"
                      onClick={() => {
                        setShowSidebar(false);
                        setIsChoiceModalOpen(true);
                      }}
                      style={{ willChange: "transform" }}
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
                      {activePartner || activeUser ? t("sidebar.frontPage") : t("sidebar.home")}
                    </span>
                  </button>
                  {/* Show user-only links when logged in as user */}
                  {activePartner && (
                    <>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/partner/statistics");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={myBoligmatchIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {t("sidebar.mitBoligmatch")}
                        </span>
                      </button>
                      <button
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
                      </button>
                    </>
                  )}

                  {activeUser && (
                    <>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/user/profile");
                        }}
                        className="w-full text-left px-3 py-2.5 text-white text-base font-semibold hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 cursor-pointer">
                          <img
                            src={myBoligmatchIcon}
                            alt=""
                            className="w-[30px] h-[30px]"
                          />
                          {t("sidebar.mitBoligmatch")}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setShowSidebar(false);
                          navigate("/user/manage-profile");
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
                    </>
                  )}
                  {/* Show partner-only links when logged in as partner */}
                  {activePartner && (
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
                    <span className="flex items-center gap-2  cursor-pointer">
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
                {activePartner || activeUser ? (
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
                    className="w-full text-left px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                    style={{ willChange: "transform" }}
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

export default PartnerHeader;
