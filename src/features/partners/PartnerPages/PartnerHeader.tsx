import { useState, useEffect } from "react";
import userLogo from "/src/assets/userImages/footerLogo.svg";
import userHeader from "/src/assets/userImages/userHeader.png";
import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import { useTranslation } from "react-i18next";

function PartnerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentLang = i18n.language || "en";

  return (
    <>
      <header className="h-[100vh] relative">
        <div
          className={`fixed top-0 left-0 right-0 h-16 sm:h-18 md:h-20 px-4 sm:px-6 md:px-8 lg:px-12 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="">
              <img
                className={`duration-300 cursor-pointer ${
                  isScrolled 
                    ? "h-8 sm:h-9 md:h-10" 
                    : "h-10 sm:h-11 md:h-12"
                }`}
                src={userLogo}
                alt="Boligmatch Logo"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <span className="text-xs sm:text-sm font-medium">
                  {currentLang.toUpperCase()}
                </span>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
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
                <div className="absolute top-full right-4 sm:right-8 md:right-12 lg:right-30 mt-1 w-32 sm:w-36 md:w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    English (EN)
                  </button>  
                  <button
                    onClick={() => {
                      i18n.changeLanguage("da");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Dansk (DA)
                  </button>
                </div>
              )}
              <button className="p-1 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <img
                  src={userHeader}
                  alt="User Profile"
                  className={`duration-300 cursor-pointer ${
                    isScrolled 
                      ? "h-8 sm:h-9 md:h-10" 
                      : "h-10 sm:h-11 md:h-12"
                  }`}
                />
              </button>

              <button className="p-1 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <img
                  src={userHeaderHamburger}
                  alt="Menu"
                  className={`duration-300 cursor-pointer ${
                    isScrolled 
                      ? "h-5 sm:h-6" 
                      : "h-6 sm:h-7 md:h-8"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default PartnerHeader;
