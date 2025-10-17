import React, { useState, useEffect } from "react";
import userLogo from "/src/assets/userImages/footerLogo.svg";
import userHeader from "/src/assets/userImages/userHeader.png";
import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import { useTranslation } from "react-i18next";

function PartnerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { t, i18n } = useTranslation();

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
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
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
                <div className="absolute top-full right-30 mt-0 w-40 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => {
                      i18n.changeLanguage("da");
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Dansk (DA)
                  </button>
                </div>
              )}
              <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <img
                  src={userHeader}
                  alt=""
                  className={`duration-300 ${
                    isScrolled ? "h-10" : "h-12"
                  } cursor-pointer`}
                />
              </button>

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
    </>
  );
}

export default PartnerHeader;
