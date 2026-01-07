import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import aboutLogo from "/src/assets/userImages/about.png";
import leftArrow from "/src/assets/userImages/arrow-left.svg";
import Footer from "./Footer";

export default function AboutBoligmatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#01351f] text-white">
      <header className="px-4 py-4 sm:px-6 sm:py-6">
        <button
          onClick={() => {
            // Smart back: use browser back if history exists, otherwise redirect to "/"
            const hasHistory = window.history.length > 1;
            const hasState = location.state !== null && location.state !== undefined;
            const hasLocationKey = location.key !== 'default' && location.key !== null;
            const notOnHome = location.pathname !== '/';
            
            const canGoBack = hasHistory && (hasState || hasLocationKey || (notOnHome && window.history.length > 2));
            
            if (canGoBack) {
              navigate(-1);
            } else {
              navigate('/', { replace: true });
            }
          }}
          className="p-2 cursor-pointer"
          aria-label="Back"
        >
          <img className="w-[51px] h-[51px]" src={leftArrow} alt="" />
        </button>
      </header>

      <main className="px-6 pb-10 flex flex-col items-center">
        <div className="flex flex-col items-center text-center w-full max-w-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 flex items-center justify-center">
            <img src={aboutLogo} alt="" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold mb-4">
            {t("aboutBoligmatch.title")}
          </h1>

          <div className="space-y-5 text-base md:text-[18px] leading-relaxed text-white/90">
            <p>{t("aboutBoligmatch.paragraph1")}</p>
            <p>{t("aboutBoligmatch.paragraph2")}</p>
            <p>{t("aboutBoligmatch.paragraph3")}</p>
            <p>{t("aboutBoligmatch.paragraph4")}</p>
            <p>{t("aboutBoligmatch.paragraph5")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
