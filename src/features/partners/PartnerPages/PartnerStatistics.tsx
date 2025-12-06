import PartnerHeader from "./PartnerHeader";
import parentStatisticsImg from "/src/assets/userSupplier/partnerDashboard.svg";
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
        typeof window !== "undefined" ? localStorage.getItem("bm_partner") : null;
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
      {/* <div
        className="md:min-h-screen relative bg-cover bg-no-repeat bg-[position:center_30%] sm:bg-[position:center_28%] md:bg-center"
        style={{
          backgroundImage: `url(${parentStatisticsImg})`,
        }}
      > */}
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

        <div className="flex flex-col">
          <div className="flex items-center md:justify-start px-4 pb-4 md:px-12 md:pt-6 md:pb-6 absolute left-18 top-54 md:top-24 md:left-12">
            <div className="mx-auto text-white text-center md:text-left">
              <h1 className="text-[24px] md:text-[64px] font-[800] tracking-tight leading-tight mb-1 md:mb-3">
                {t("partnerStatistics.title")}
              </h1>
              <h2 className="text-[24px] md:text-[64px] font-[500] tracking-tight">
                {partnerData?.businessName || "Business Name"}
              </h2>
            </div>
          </div>
          {/* <div className="px-4 md:px-12 mt-3 md:mt-0 py-3 md:py-6 absolute bottom-4 left-4 md:bottom-0 md:left-0 md:right-0">
            <div className="flex flex-row flex-nowrap items-center justify-center md:justify-center gap-2 md:gap-0 md:space-x-8">
              <button
                onClick={() => setActiveTab("statistik")}
                className={`whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 text-white rounded-lg transition-colors cursor-pointer ${activeTab === "statistik"
                    ? "bg-[#07583A]"
                    : "bg-[#91C73D] hover:bg-[#7FB333]"
                  }`}
              >
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Statistik} alt="" />
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  {t("partnerStatistics.tabs.statistics")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("profil")}
                className={`whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 text-white rounded-lg transition-colors cursor-pointer ${activeTab === "profil"
                    ? "bg-[#07583A]"
                    : "bg-[#91C73D] hover:bg-[#7FB333]"
                  }`}
              >
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={MinProfil} alt="" />
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  {t("partnerStatistics.tabs.profile")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("partnere")}
                className={`whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 text-white rounded-lg transition-colors cursor-pointer ${activeTab === "partnere"
                    ? "bg-[#07583A]"
                    : "bg-[#91C73D] hover:bg-[#7FB333]"
                  }`}
              >
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Partnere} alt="" />
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  {t("partnerStatistics.tabs.partners")}
                </span>
              </button>
            </div>
          </div> */}
          <div className="px-4 md:px-12 mt-3 md:mt-0 py-3 md:py-6 absolute bottom-4 left-4 md:bottom-0 md:left-0 md:right-0">
  <div className="flex flex-row flex-nowrap items-center justify-center md:justify-center gap-3 md:gap-6 lg:gap-8">
    {/* <button
      onClick={() => setActiveTab("statistik")}
      className={`
        whitespace-nowrap 
        flex items-center justify-center 
        space-x- md:space-x-3 
        w-[188px] h-[55px] 
        text-white 
        rounded-[11px] 
        transition-all duration-200 
        cursor-pointer 
        font-['Plus_Jakarta_Sans'] font-semibold
        text-[20px] leading-[100%]
        ${activeTab === "statistik"
          ? "bg-[#07583A] shadow-lg"
          : "bg-[#91C73D] hover:bg-[#7FB333] hover:shadow-md"
        }
      `}
    >
      <div className="flex items-center justify-center w-[25.5px] h-[28px]">
        <img 
          src={Statistik} 
          alt="Statistics" 
          className="w-full h-full object-contain"
        />
      </div>
      <span className="text-[20px] font-semibold tracking-[0%]">
        {t("partnerStatistics.tabs.statistics")}
      </span>
    </button> */}

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
    ${activeTab === "statistik"
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
        ${activeTab === "profil"
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
        ${activeTab === "partnere"
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
      {activeTab === "statistik" && (
        <PartnerStatDetails partnerData={partnerData} />
      )}
      {activeTab === "profil" && (
        <PartnerProfileShortcut partnerData={partnerData} />
      )}
{/* 
      {activeTab === "profil" && (
        <SupplierProfile partnerData={partnerData} />
      )} */}
      {activeTab === "partnere" && <SearchForPartner />}
    </>
  );
}

export default ParentStatistics;

