import PartnerHeader from "./PartnerHeader";
import parentStatisticsImg from "/src/assets/userImages/statsBg.png";
import Statistik from "/src/assets/userImages/Statistik.svg";
import MinProfil from "/src/assets/userImages/Minprofil.svg";
import Partnere from "/src/assets/userImages/Search.svg";
import PartnerStatDetails from "./PartnerStatDetails";
import PartnerProfileShortcut from "./PartnerProfileShortcut";
//import SupplierProfile from "../../../pages/SupplierProfile";
import SearchForPartner from "./SearchForPartner";
import { useEffect, useRef, useState } from "react";
import { partnerService } from "../../../services/partner.service";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function ParentStatistics() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "statistik" | "profil" | "partnere"
  >("statistik");
  const [partnerData, setPartnerData] = useState<any>(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("bm_partner")
          : null;
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parsing bm_partner from localStorage:", error);
      return null;
    }
  });
  const calledRef = useRef(false);
  console.log("Partner Data:", partnerData);

  useEffect(() => {
    const storedPartner = localStorage.getItem("bm_partner");
    if (!storedPartner) {
      navigate("/");
    }
  }, [navigate]);

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
        console.log("Decoded Token Payload:", jsonPayload);

        partnerId = jsonPayload?.partnerId;
        console.log("Partner ID:", partnerId);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    const fetchPartnerDetails = async () => {
      if (!partnerId) return console.error("No Partner ID found in token");

      try {
        const response = await partnerService.getById(partnerId);
        console.log("Partner Details:", response);
        if (response?.output) {
          setPartnerData(response.output);
          try {
            localStorage.setItem("bm_partner", JSON.stringify(response.output));
          } catch (error) {
            console.error("Unable to persist bm_partner", error);
          }
        }
      } catch (error) {
        console.error("Error fetching partner details", error);
      }
    };

    fetchPartnerDetails();
  }, []);

  return (
    <>
      <div className="bg-cover bg-center bg-no-repeat md:h-[100vh] h-[50vh]"
        style={{ backgroundImage: `url(${parentStatisticsImg})` }}
        >
        <PartnerHeader />

        <div className="flex flex-col bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)]">
          <div className="">
            <div className="text-white text-center md:text-left pt-46 md:pl-28">
              <h1 className="text-[24px] md:text-[60px] font-[800] tracking-tight leading-[45px] [text-shadow:_0_4px_20px_rgba(0,0,0,0.8)]">
                {t("partnerStatistics.title")}</h1>
              <h2 className="text-[24px] md:text-[55px] font-[500] tracking-tight [text-shadow:_0_4px_20px_rgba(0,0,0,0.8)]"> {partnerData?.businessName || "Business Name"}</h2>
            </div>
            <div className="flex justify-center gap-2 md:gap-6 bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] w-full pt-8 md:pt-23 pb-8 md:pb-13">

              <button
                onClick={() => setActiveTab("statistik")}
                type="button"
                className={`
      flex items-center justify-center
      gap-1 md:gap-3
      w-[272px] h-[42px] md:h-[55px]
      px-5 sm:px-6 md:px-7
      rounded-xl
      shadow-lg sm:shadow-md
      hover:opacity-90
      transition
      cursor-pointer
      figtree
      font-semibold text-[10px] md:text-[20px]
      ${activeTab === "statistik" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
    `}
              >
                <img src={Statistik} alt="Statistics" className="h-[18px] w-[18px] md:h-6 md:w-6" />
                <span className="whitespace-nowrap hidden sm:inline">
                  {t("partnerStatistics.tabs.statistics")}
                </span>
                <span className="whitespace-nowrap sm:hidden">
                  {t("partnerStatistics.tabs.statistics")}
                </span>
              </button>

              {/* Profile */}
              <button
                onClick={() => setActiveTab("profil")}
                type="button"
                className={`
      flex items-center justify-center
      gap-1 md:gap-3
      w-[272px] h-[42px] md:h-[55px]
      px-5 sm:px-6 md:px-7
      rounded-xl
      shadow-lg sm:shadow-md
      hover:opacity-90
      transition
      cursor-pointer
      figtree
      font-semibold text-[10px] md:text-[20px]
      ${activeTab === "profil" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
    `}
              >
                <img src={MinProfil} alt="Profile" className="h-[18px] w-[18px] md:h-6 md:w-6" />
                <span className="whitespace-nowrap hidden sm:inline">
                  {t("partnerStatistics.tabs.profile")}
                </span>
                <span className="whitespace-nowrap sm:hidden">
                  {t("partnerStatistics.tabs.profile")}
                </span>
              </button>

              {/* Partners */}
              <button
                onClick={() => setActiveTab("partnere")}
                type="button"
                className={`
      flex items-center justify-center
      gap-1 md:gap-3
      w-[272px] h-[42px] md:h-[55px]
      px-5 sm:px-6 md:px-7
      rounded-xl
      shadow-lg sm:shadow-md
      hover:opacity-90
      transition
      cursor-pointer
      figtree
      font-semibold text-[10px] md:text-[20px]
      ${activeTab === "partnere" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
    `}
              >
                <img src={Partnere} alt="Partners" className="h-[18px] w-[18px] md:h-6 md:w-6" />
                <span className="whitespace-nowrap hidden sm:inline">
                  {t("partnerStatistics.tabs.partners")}
                </span>
                <span className="whitespace-nowrap sm:hidden">
                  {t("partnerStatistics.tabs.partners")}
                </span>
              </button>

            </div>

          </div>
          <div className="h-full w-full bg-[#01351F] flex flex-col justify-center items-start">
            <div className="w-full">
              {activeTab === "statistik" && (
                <PartnerStatDetails partnerData={partnerData} />
              )}
            </div>
          </div>
        </div>
        {activeTab === "profil" && (
          <PartnerProfileShortcut partnerData={partnerData} />
        )}
        {activeTab === "partnere" && <SearchForPartner />}
      </div>
    </>
  );
}

export default ParentStatistics;
