import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "./Footer";
import leftArrow from "/src/assets/userImages/arrow-left.svg";
import policyIcon from "/src/assets/userImages/Privacypolicy.svg";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#01351f] text-white">
      <header className="px-4 py-4 sm:px-6 sm:py-6">
        <button
          onClick={() => {
            const hasHistory = window.history.length > 1;
            const hasState =
              location.state !== null && location.state !== undefined;
            const hasLocationKey =
              location.key !== "default" && location.key !== null;
            const notOnHome = location.pathname !== "/";

            const canGoBack =
              hasHistory &&
              (hasState || hasLocationKey || (notOnHome && window.history.length > 2));

            if (canGoBack) {
              navigate(-1);
            } else {
              navigate("/", { replace: true });
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
            <img
              src={policyIcon}
              alt=""
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold mb-4">
            {t("privacyPolicy.title")}
          </h1>

          <div className="space-y-5 text-sm sm:text-base leading-relaxed text-white/90 text-left">
            <p>{t("privacyPolicy.intro")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.dataController.title")}
            </h2>
            <div className="space-y-1">
              <p>{t("privacyPolicy.sections.dataController.company")}</p>
              <p>{t("privacyPolicy.sections.dataController.address")}</p>
              <p>{t("privacyPolicy.sections.dataController.city")}</p>
              <p>{t("privacyPolicy.sections.dataController.cvr")}</p>
              <p>{t("privacyPolicy.sections.dataController.email")}</p>
              <p>{t("privacyPolicy.sections.dataController.responsibility")}</p>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.collectedData.title")}
            </h2>
            <p className="font-semibold text-white">
              {t("privacyPolicy.sections.collectedData.providedByYou.title")}
            </p>
            <p>{t("privacyPolicy.sections.collectedData.providedByYou.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacyPolicy.sections.collectedData.providedByYou.items.name")}</li>
              <li>{t("privacyPolicy.sections.collectedData.providedByYou.items.email")}</li>
              <li>{t("privacyPolicy.sections.collectedData.providedByYou.items.phone")}</li>
              <li>{t("privacyPolicy.sections.collectedData.providedByYou.items.postalCode")}</li>
              <li>
                {t(
                  "privacyPolicy.sections.collectedData.providedByYou.items.contactFormDetails"
                )}
              </li>
            </ul>
            <p className="font-semibold text-white">
              {t("privacyPolicy.sections.collectedData.usageData.title")}
            </p>
            <p>{t("privacyPolicy.sections.collectedData.usageData.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacyPolicy.sections.collectedData.usageData.items.profileVisits")}</li>
              <li>{t("privacyPolicy.sections.collectedData.usageData.items.favorites")}</li>
              <li>{t("privacyPolicy.sections.collectedData.usageData.items.inquiries")}</li>
              <li>{t("privacyPolicy.sections.collectedData.usageData.items.technical")}</li>
            </ul>
            <p>{t("privacyPolicy.sections.collectedData.noSensitiveData")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.purposes.title")}
            </h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-semibold text-white">
                  {t("privacyPolicy.sections.purposes.items.serviceDelivery.title")}
                </p>
                <p>{t("privacyPolicy.sections.purposes.items.serviceDelivery.body")}</p>
              </li>
              <li>
                <p className="font-semibold text-white">
                  {t("privacyPolicy.sections.purposes.items.forwardInquiries.title")}
                </p>
                <p>{t("privacyPolicy.sections.purposes.items.forwardInquiries.body")}</p>
              </li>
              <li>
                <p className="font-semibold text-white">
                  {t("privacyPolicy.sections.purposes.items.improvePlatform.title")}
                </p>
                <p>{t("privacyPolicy.sections.purposes.items.improvePlatform.body")}</p>
              </li>
              <li>
                <p className="font-semibold text-white">
                  {t("privacyPolicy.sections.purposes.items.communicate.title")}
                </p>
                <p>{t("privacyPolicy.sections.purposes.items.communicate.body")}</p>
              </li>
            </ol>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.sharing.title")}
            </h2>
            <p>{t("privacyPolicy.sections.sharing.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacyPolicy.sections.sharing.items.partners")}</li>
              <li>{t("privacyPolicy.sections.sharing.items.processors")}</li>
            </ul>
            <p>{t("privacyPolicy.sections.sharing.noSelling")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.retention.title")}
            </h2>
            <p>{t("privacyPolicy.sections.retention.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacyPolicy.sections.retention.items.account")}</li>
              <li>{t("privacyPolicy.sections.retention.items.inquiries")}</li>
              <li>{t("privacyPolicy.sections.retention.items.logs")}</li>
            </ul>
            <p>{t("privacyPolicy.sections.retention.deleteRequest")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.rights.title")}
            </h2>
            <p>{t("privacyPolicy.sections.rights.intro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacyPolicy.sections.rights.items.access")}</li>
              <li>{t("privacyPolicy.sections.rights.items.rectification")}</li>
              <li>{t("privacyPolicy.sections.rights.items.erasure")}</li>
              <li>{t("privacyPolicy.sections.rights.items.restriction")}</li>
              <li>{t("privacyPolicy.sections.rights.items.objection")}</li>
              <li>{t("privacyPolicy.sections.rights.items.portability")}</li>
              <li>{t("privacyPolicy.sections.rights.items.withdrawConsent")}</li>
            </ul>
            <p>{t("privacyPolicy.sections.rights.contact")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.cookies.title")}
            </h2>
            <p>{t("privacyPolicy.sections.cookies.body")}</p>
            <p>{t("privacyPolicy.sections.cookies.browserSettings")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.security.title")}
            </h2>
            <p>{t("privacyPolicy.sections.security.body")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.changes.title")}
            </h2>
            <p>{t("privacyPolicy.sections.changes.body")}</p>

            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {t("privacyPolicy.sections.contact.title")}
            </h2>
            <p>{t("privacyPolicy.sections.contact.intro")}</p>
            <div className="space-y-1">
              <p>{t("privacyPolicy.sections.contact.name")}</p>
              <p>{t("privacyPolicy.sections.contact.email")}</p>
              <p>{t("privacyPolicy.sections.contact.phone")}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

