import Modal from "./Modal";
import logo from "/src/assets/userImages/footerLogo.svg";
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

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full mx-auto">
        <div className="flex justify-center items-center p-6 pb-4 relative">
          <img
            src={logo}
            alt="Boligmatch"
            className="h-7 w-auto"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(1000%) hue-rotate(120deg) brightness(0.3) contrast(1.2)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-6 text-black hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-2">
          <h2 className="text-[20px] font-[800] text-[#000000] text-center">
            {/* Log ind */}
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
    </Modal>
  );
}
