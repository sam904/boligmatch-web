import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userLogo from "/src/assets/userImages/footerLogo.svg";
import userHeader from "/src/assets/userImages/userHeader.png";
import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import UserModal from "../../../components/common/UserModal";
import LoginChoiceModal from "../../../components/common/LoginChoiceModal";
import { useTranslation } from "react-i18next";

function UserHeader() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { i18n } = useTranslation();

  const currentLang = i18n.language || "en";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Get user data from localStorage
    const getUserData = () => {
      try {
        const userStr = localStorage.getItem('bm_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    };

    getUserData();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('bm_user');
    localStorage.removeItem('bm_access');
    localStorage.removeItem('bm_refresh');
    
    // Reset user data state
    setUserData(null);
    
    // Close dropdown
    setShowUserDropdown(false);
    
    // Redirect to userDashboard
    navigate('/userDashboard');
  };

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
              <div className="absolute top-full right-24 -mt-2 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
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
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {userData.firstName} {userData.lastName}
                  </span>
                </div>
                
                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
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

            <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
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

      {/* Choice Modal */}
      <LoginChoiceModal 
        open={isChoiceModalOpen} 
        onClose={() => setIsChoiceModalOpen(false)}
        onSelect={() => {
          setIsChoiceModalOpen(false);
          setIsModalOpen(true);
        }}
      />
      
      {/* User Modal */}
      <UserModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default UserHeader;
