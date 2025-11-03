// import React from "react";
import loginModelLogo from "/src/assets/userImages/boligmatchLogo2.png";
import chooseUserImg from "/src/assets/userImages/choose_userImg.svg";
import choosePartnerImg from "/src/assets/userImages/choose_partnerImg.svg";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (role: "user" | "partner") => void;
};

export default function LoginChoiceModal({ open, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  const goToLogin = (role: "user" | "partner") => {
    try {
      sessionStorage.setItem("bm_login_role", role);
    } catch {}
    if (onSelect) onSelect(role);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#E6E7E9] rounded-[23px] shadow-lg w-[370px] h-[444px] mx-4">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[18px] top-[18px] h-[31px] w-[31px] p-0 flex items-center justify-center rounded-full text-black hover:bg-black/5 transition"
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
    </div>
  );
}
