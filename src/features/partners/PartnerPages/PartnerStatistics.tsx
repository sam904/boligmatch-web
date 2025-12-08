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
          className="pointer-events-none absolute inset-x-0 bottom-0 partner-hero-gradient"
          style={{
            background:
              "linear-gradient(180deg, rgba(1, 53, 31, 0) 0%, rgba(1, 53, 31, 0.3) 40%, rgba(1, 53, 31, 0.7) 70%, #01351F 100%)",
          }}
        />

        <div className="flex flex-col">
          <div className="flex items-center md:justify-start px-4 pb-4 md:px-12 md:pt-6 md:pb-6 absolute left-18 top-54 md:top-36 md:left-18 z-10">
            <div className="mx-auto text-white text-center md:text-left">
              <h1 className="text-[24px] md:text-[64px] font-[800] tracking-tight leading-tight">
                {t("partnerStatistics.title")}
              </h1>
              <h2 className="text-[24px] md:text-[60px] font-[500] tracking-tight">
                {partnerData?.businessName || "Business Name"}
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Buttons Section - positioned over image */}
        <div className="absolute bottom-32 md:bottom-36 left-0 right-0 z-20">
          <div className="px-4 md:px-12">
            <div className="flex flex-row flex-nowrap items-center justify-center md:justify-center gap-3 md:gap-6 lg:gap-8">
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
          </div>
        </div>
      </div>

      {/* Stats section starts immediately after hero */}
      {activeTab === "statistik" && (
        <PartnerStatDetails partnerData={partnerData} />
      )}
      {activeTab === "profil" && (
        <PartnerProfileShortcut partnerData={partnerData} />
      )}
      {activeTab === "partnere" && <SearchForPartner />}
    </>
  );
}

export default ParentStatistics;
