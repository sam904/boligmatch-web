import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userLogo from "/src/assets/userImages/footerLogo.svg";
import userHeader from "/src/assets/userImages/userHeader.png";
import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import PartnerModal from "../../../components/common/PartnerModal";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/hooks";
import { tokenStorage } from "../../../lib/storage";
// import { logout } from "../../../features/auth/authSlice";

function UserHeader() {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  // const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { i18n, t } = useTranslation();

  // Get user data from Redux store instead of localStorage
  const userData = useAppSelector((state) => state.auth.user);

  const currentLang = i18n.language || "en";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const handleLogout = () => {
  //   // Dispatch logout action to clear Redux state
  //   dispatch(logout());

  //   // Close dropdown
  //   setShowUserDropdown(false);

  //   // Redirect to userDashboard and reload
  //   window.location.href = "/";
  // };

  return (
    <>
      <header className="h-[100vh] relative">
        <div
          className={`fixed top-0 left-0 right-0 h-20 px-12 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="">
              <img
                onClick={() => navigate("/userProfile")}
                className={`duration-300 ${
                  isScrolled ? "h-10" : "h-12"
                } cursor-pointer`}
                src={userLogo}
                alt=""
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                <span className="text-sm font-medium">
                  {currentLang.toUpperCase()}
                </span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showLangDropdown && (
                <div className="absolute top-full right-44 -mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => {
                      i18n.changeLanguage("da");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Dansk (DA)
                  </button>
                </div>
              )}
              {userData ? (
                <div
                  className="relative"
                  // onMouseEnter={() => setShowUserDropdown(true)}
                  // onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="flex items-center gap-3 cursor-pointer">
                    {/* <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {userData.firstName?.charAt(0)}
                        {userData.lastName?.charAt(0)}
                      </span>
                    </div> */}
                    <span className="text-white text-sm font-medium">
                      {userData.firstName} {userData.lastName}
                    </span>
                  </div>

                  {/* User Dropdown */}
                  {/* {showUserDropdown && (
                    <div className="absolute top-full right-0 mt-0 w-32 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )} */}
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
                      isScrolled ? "h-10" : "h-12"
                    } cursor-pointer`}
                  />
                </button>
              )}

              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 text-white transition-colors"
              >
                <img
                  src={userHeaderHamburger}
                  alt=""
                  className={`duration-300 ${
                    isScrolled ? "h-6" : "h-8"
                  } cursor-pointer`}
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
          <div className="absolute right-0 top-0 h-full w-80 bg-[#043428] shadow-2xl transform transition-all duration-500 ease-out translate-x-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
                    >
                      <span className="text-sm font-medium">
                        {currentLang.toUpperCase()}
                      </span>
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {showLangDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                        <button
                          onClick={() => {
                            i18n.changeLanguage("en");
                            setShowLangDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          English (EN)
                        </button>
                        <button
                          onClick={() => {
                            i18n.changeLanguage("da");
                            setShowLangDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          Dansk (DA)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Profile in Sidebar */}
                  {userData ? (
                    <div className="flex items-center gap-3">
                      {/* <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {userData.firstName?.charAt(0)}
                          {userData.lastName?.charAt(0)}
                        </span>
                      </div> */}
                      <span className="text-white text-sm font-medium">
                        {userData.firstName} {userData.lastName}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                      onClick={() => {
                        setShowSidebar(false);
                        setIsChoiceModalOpen(true);
                      }}
                    >
                      <img
                        src={userHeader}
                        alt=""
                        className="h-6 w-6 cursor-pointer"
                      />
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
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
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-6">
                <nav className="space-y-2">
                  {/* Home */}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="font-medium">{t("sidebar.home")}</span>
                  </button>

                  {/* Dashboard */}
                  {userData && (
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        navigate("/userDashboard");
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
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
                          d="M3 12l2-2m0 0l7-7 7 7m-6 6v8m0 0a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1v-8"
                        />
                      </svg>
                      <span className="font-medium">
                        {t("sidebar.dashboard")}
                      </span>
                    </button>
                  )}

                  {/* Documents - Visible only for Partners */}
                  {userData &&
                    userData.roleName?.toLowerCase() === "partner" && (
                      <>
                        <button
                          onClick={() => {
                            setShowSidebar(false);
                            navigate("/documents");
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
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
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span className="font-medium">
                            {t("sidebar.favourites")}
                          </span>
                        </button>

                        {/* Partners */}
                        <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3">
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
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-medium">
                            {t("sidebar.partners")}
                          </span>
                        </button>
                      </>
                    )}

                  {/* Messages */}
                  <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3">
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
                        d="M8 10h8m-8 4h5m-9 4h14a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2zm0 0v4l4-4"
                      />
                    </svg>
                    <span className="font-medium">{t("sidebar.messages")}</span>
                  </button>

                  {/* Profile Settings */}
                  <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3">
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
                        d="M12 4v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M9 17a5 5 0 106 0M12 17v1m0-13a9 9 0 110 18 9 9 0 010-18z"
                      />
                    </svg>
                    <span className="font-medium">
                      {t("sidebar.profileSettings")}
                    </span>
                  </button>

                  {/* Privacy Policy */}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/privacy");
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
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
                        d="M12 12v9m0 0l-3-3m3 3l3-3m-9-5V5a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2H9a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {t("sidebar.privacyPolicy")}
                    </span>
                  </button>

                  {/* Terms of Service */}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      navigate("/terms");
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {t("sidebar.termsOfService")}
                    </span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setShowSidebar(false);
                      // Clear auth and related cached data
                      tokenStorage.clearAll();
                      localStorage.removeItem("bm_currentPartner");
                      localStorage.removeItem("bm_subcategories");
                      localStorage.removeItem("bm_currentSubCategory");
                      // Hard redirect to ensure Redux state resets from storage
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5 text-red-400"
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
                </nav>
              </div>

              {/* Footer CTA */}
              <div className="p-6 border-t border-white/10 space-y-3"></div>
            </div>
          </div>
        </div>
      )}

      {/* Choice Modal */}
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

      {/* User Modal */}
      {isModalOpen && (
        <UserModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
      {/* Partner Modal */}
      {isPartnerModalOpen && (
        <PartnerModal open={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
      )}
    </>
  );
}

export default UserHeader;
