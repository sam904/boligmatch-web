import loginModelLogo from "/src/assets/userImages/boligmatchLogo2.svg";
import chooseUserImg from "/src/assets/userImages/choose_userImg.svg";
import choosePartnerImg from "/src/assets/userImages/choose_partnerImg.svg";
import { useTranslation } from "react-i18next";
import ReactDOM from "react-dom";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (role: "user" | "partner") => void;
  closable?: boolean;
};

export default function LoginChoiceModal({ open, onClose, onSelect, closable = true }: Props) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      // Reset to closed state first
      setIsVisible(false);
      // Use setTimeout to ensure the initial closed state is rendered before animating
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = original;
      };
    } else {
      setIsVisible(false);
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const goToLogin = (role: "user" | "partner") => {
    try {
      sessionStorage.setItem("bm_login_role", role);
    } catch {}
    if (onSelect) onSelect(role);
  };

  if (!open && !isAnimating) return null;

  return ReactDOM.createPortal(
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-500 ease-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ willChange: 'opacity' }}
    >
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: 'opacity' }}
        {...(closable ? { onClick: onClose } : {})} 
      />
      <div 
        className={`relative bg-[#E6E7E9] rounded-[23px] shadow-lg w-[370px] h-[444px] mx-4 transition-all duration-500 ${
          isVisible 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-90 translate-y-8"
        }`}
        style={{ 
          willChange: 'transform, opacity',
          transitionDelay: isVisible ? '100ms' : '0ms',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {closable && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-[18px] top-[18px] h-[31px] w-[31px] p-0 flex items-center justify-center rounded-full text-black hover:bg-black/5 transition cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-[31px] w-[31px]"
            >
              <path
                fillRule="evenodd"
                d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 1 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <div className="flex justify-center items-center px-6 pt-[62px] pb-4">
          <img
            src={loginModelLogo}
            alt="Boligmatch"
            className="h-[36px] w-auto"
          />
        </div>

        <div className="px-6 pb-14 pt-[20px]">
          <h2 className="text-[20px] font-[800] text-[#000000] text-center">
            {t("auth.signIn")}
          </h2>
        </div>

        <div className="px-8 pb-8 grid grid-cols-2 gap-6">
          <button
            onClick={() => goToLogin("user")}
            className="flex flex-col items-center cursor-pointer gap-4 group hover:bg-gray-50 rounded-lg p-4 transition-colors"
          >
            <img
              src={chooseUserImg}
              alt="User"
              className="w-[45px] h-[109px]"
            />
            <span className="text-[#000] font-[700]">{t("auth.userRole")}</span>
          </button>

          <button
            onClick={() => goToLogin("partner")}
            className="flex flex-col items-center gap-4 group cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors"
          >
            <img
              src={choosePartnerImg}
              alt="Partner"
              className="w-[106px] h-[109px]"
            />
            <span className="text-[#000] font-[700]">Partner</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
