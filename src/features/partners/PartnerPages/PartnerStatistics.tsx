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
      <div
        className={`
          relative
              h-[368px]      
              md:h-[100vh]     
              bg-no-repeat bg-cover bg-center
              bg-[url('/src/assets/userImages/mobile-landingImg.png')] 
              md:bg-none       
  `}
        style={{
          backgroundImage: `url(${parentStatisticsImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <PartnerHeader />

        {/* Gradient overlay at bottom */}
        <style>{`
          @media (max-width: 767px) {
            .partner-hero-gradient { height: 40%; }
          }
          @media (min-width: 768px) {
            .partner-hero-gradient { height: 400px; }
          }
        `}</style>


        <div
          className="pointer-events-none "
          style={{
            background:
              "linear-gradient(180deg, rgba(1, 53, 31, 0) 0%, rgba(1, 53, 31, 0.3) 40%, rgba(1, 53, 31, 0.7) 70%, #01351F 100%)",
          }}
        />

        <div className="flex items-center h-[70vh] bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)]">
          <div className="flex items-center md:justify-start px-4 pb-20 md:px-12 md:pt-6 md:pb-6 z-10">
            <div className=" text-white text-center md:text-left">
              <h1 className="text-[24px] md:text-[60px] font-[800] tracking-tight leading-[40px]">
                {t("partnerStatistics.title")}
              </h1>
              <h2 className="text-[24px] md:text-[55px] font-[500] tracking-tight">
                {partnerData?.businessName || "Business Name"}
              </h2>
            </div>
          </div>
        </div>

<div className="absolute bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] h-[400px] w-full">
  <div className="flex justify-center space-x-5 bg-[#01351f]">
 <button
                onClick={() => setActiveTab("statistik")}
                className={`
                flex items-center justify-center
                gap-3
                w-[188px] h-[55px]
                text-white
                rounded-[11px]
                transition-all duration-200
                cursor-pointer
                font-['Plus_Jakarta_Sans'] font-semibold text-[20px]
                ${
                  activeTab === "statistik"
                    ? "bg-[#07583A] shadow-lg"
                    : "bg-[#91C73D] hover:bg-[#7FB333] hover:shadow-md"
                }
              `}
              >
                {/* ICON PERFECTLY CENTERED */}
                <div className="flex items-center justify-center w-[26px] h-[26px]">
                  <img
                    src={Statistik}
                    alt="Statistics"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* TEXT PERFECTLY CENTERED */}
                <span className="flex items-center leading-none">
                  {t("partnerStatistics.tabs.statistics")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("profil")}
                className={`
                whitespace-nowrap 
                flex items-center justify-center 
                space-x-2 md:space-x-3 
                w-[188px] h-[55px] 
                text-white 
                rounded-[11px] 
                transition-all duration-200 
                cursor-pointer 
                font-['Plus_Jakarta_Sans'] font-semibold
                text-[20px] leading-[100%]
                ${
                  activeTab === "profil"
                    ? "bg-[#07583A] shadow-lg"
                    : "bg-[#91C73D] hover:bg-[#7FB333] hover:shadow-md"
                }
              `}
              >
                <div className="flex items-center justify-center w-[25.5px] h-[28px]">
                  <img
                    src={MinProfil}
                    alt="Profile"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[20px] font-semibold tracking-[0%]">
                  {t("partnerStatistics.tabs.profile")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("partnere")}
                className={`
        whitespace-nowrap 
        flex items-center justify-center 
        space-x-2 md:space-x-3 
        w-[188px] h-[55px] 
        text-white 
        rounded-[11px] 
        transition-all duration-200 
        cursor-pointer 
        font-['Plus_Jakarta_Sans'] font-semibold
        text-[20px] leading-[100%]
        ${
          activeTab === "partnere"
            ? "bg-[#07583A] shadow-lg"
            : "bg-[#91C73D] hover:bg-[#7FB333] hover:shadow-md"
        }
      `}
              >
                <div className="flex items-center justify-center w-[25.5px] h-[28px]">
                  <img
                    src={Partnere}
                    alt="Partners"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[20px] font-semibold tracking-[0%]">
                  {t("partnerStatistics.tabs.partners")}
                </span>
              </button>
  </div>
  {activeTab === "statistik" && (
        <PartnerStatDetails partnerData={partnerData} />
      )}
</div>
      </div>

      {activeTab === "profil" && (
        <PartnerProfileShortcut partnerData={partnerData} />
      )}
      {activeTab === "partnere" && <SearchForPartner />}
    </>
  );
}

export default ParentStatistics;
