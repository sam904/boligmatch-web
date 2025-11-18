import footerLogo from "/src/assets/userImages/footerLogo.svg";
import { useTranslation } from "react-i18next";
function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <footer className="bg-[#01351f] text-white text-center p-4 pt-42">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-[199px] h-[45px] mx-auto">
                <img
                  src={footerLogo}
                  alt="Boligmatch Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <p className="text-white text-sm figtree font-[400] text-[18px]">
            {t("landing.contactInfo")}
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
