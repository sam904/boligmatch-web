import partnerRingImg from "/src/assets/userImages/partnerringImg.png";
// import sampleImg from "/src/assets/userImages/footerLogo.svg";
import { partnerService } from "../../../services/partner.service";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../../../pages/Footer";

function PartnerStatDetails({ partnerData }: { partnerData: any }) {
  const { t } = useTranslation();
  const [partnerCount, setPartnerCount] = useState<{
    totalPartnerIdPageVisit?: number;
    totalFavourites?: number;
    totalConversations?: number;
    totalRecommendations?: number;
  } | null>(null);
  const calledRef = useRef(false);

  const statistics = [
    {
      number: partnerCount?.totalPartnerIdPageVisit ?? 0,
      label: t("partnerStatistics.stats.profileVisits"),
    },
    {
      number: partnerCount?.totalFavourites ?? 0,
      label: t("partnerStatistics.stats.totalFavorites"),
    },
    {
      number: partnerCount?.totalConversations ?? 0,
      label: t("partnerStatistics.stats.totalMessages"),
    },
    {
      number: partnerCount?.totalRecommendations ?? 0,
      label: t("partnerStatistics.stats.totalRecommendations"),
    },
  ];

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const token = localStorage.getItem("bm_access");
    let partnerId = null;

    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = JSON.parse(window.atob(base64));
        partnerId = jsonPayload?.partnerId;
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    const fetchPartnerStats = async () => {
      if (!partnerId) return console.error("No Partner ID found in token");

      try {
        const response = await partnerService.getPartnerPageCount(partnerId);
        setPartnerCount(response?.output?.[0] || {});
      } catch (error) {
        console.error("Error fetching partner details", error);
      }
    };

    fetchPartnerStats();
  }, []);

  return (
    <>
      <div className="bg-[#01351f] md:h-[450px] h-[350px]">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4  md:mb-8 mb-4 md:pt-[20px] place-items-center gap-y-4 md:gap-y-0">
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full flex flex-col items-center justify-center w-[160.515px] h-[160.184px]"
                  style={{
                    backgroundImage: `url(${partnerRingImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                >
                  <div className="text-[50px] font-[800] text-white figtree leading-none">
                    {stat.number}
                  </div>
                  <div className="text-center px-1">
                    <p className="text-white text-[12px] md:text-[13px] leading-tight text-center max-w-[85px] break-words">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="p-4 md:p-8">
            <p className="text-white text-[10px] sm:text-[20px] leading-relaxed text-center">
              {t("partnerStatistics.description")}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PartnerStatDetails;
