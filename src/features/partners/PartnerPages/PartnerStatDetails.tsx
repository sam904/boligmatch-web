import partnerRingImg from "/src/assets/userImages/partnerringImg.png";
import sampleImg from "/src/assets/userImages/footerLogo.svg";
import { partnerService } from "../../../services/partner.service";
import { useEffect, useRef, useState } from "react";

function PartnerStatDetails({ partnerData }: { partnerData: any }) {
  const [partnerCount, setPartnerCount] = useState<
    | {
        totalPartnerIdPageVisit?: number;
        totalFavourites?: number;
        totalPartners?: number;
        totalRecommendations?: number;
      }
    | null
  >(null);
  const calledRef = useRef(false);

  const statistics = [
    {
      number: partnerCount?.totalPartnerIdPageVisit ?? 0,
      label: "Besøg på min profil",
    },
    {
      number: partnerCount?.totalFavourites ?? 0,
      label: "i alt Favoritter",
    },
    {
      number: partnerCount?.totalPartners ?? 0,
      label: "samlede partnere",
    },
    {
      number: partnerCount?.totalRecommendations ?? 0,
      label: "samlede anbefalinger",
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
      <div className="bg-[#01351f] p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12 place-items-center">
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 border-dashed border-[#91C73D] flex flex-col items-center justify-center w-[188.515px] h-[188.184px]"
                  style={{
                    backgroundImage: `url(${partnerRingImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                >
                  <div className="text-[64px] font-[800] text-white figtree md:-mt-2">
                    {stat.number}
                  </div>
                  <div className="text-center px-2">
                    <p className="text-white text-[15px] leading-tight text-center max-w-[95px]">
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
              {partnerData?.descriptionShort}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#01351f] flex flex-col justify-center items-center py-2 space-y-2">
        <div className="text-center">
          <img src={sampleImg} alt="" />
        </div>
        <p className="text-white text-sm text-center">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </>
  );
}

export default PartnerStatDetails;