import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setCookie, getCookie } from "../../lib/cookies";

const CookieConsent = () => {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const userConsent = getCookie("cookie_consent");
      if (!userConsent) {
        setShowPopup(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setCookie("cookie_consent", "accepted", 365); // Store for 1 year
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-5 md:right-5 bg-white shadow-2xl p-4 md:p-6 rounded-lg max-w-sm w-[calc(100%-2rem)] md:w-auto border border-gray-200 z-[99999] transition-all duration-500 ease-out opacity-100 translate-y-0">
      <p className="text-black text-sm mb-4 leading-relaxed">
        {t("cookieConsent.message", "We use cookies to improve your experience. By continuing, you accept cookies.")}
      </p>
      <button
        onClick={handleAccept}
        className="w-full px-4 py-2.5 bg-[#06351E] text-white rounded-md hover:bg-[#01351f] active:bg-[#01351f] transition-colors duration-200 font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06351E] focus:ring-offset-2"
      >
        {t("cookieConsent.accept", "Accept All Cookies")}
      </button>
    </div>
  );
};

export default CookieConsent;

