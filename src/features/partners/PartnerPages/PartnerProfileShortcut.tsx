import { useEffect, useState } from "react";
import { partnerService } from "../../../services/partner.service";
import Footer from "../../../pages/Footer";
import trustPilotLogo from "/src/assets/userImages/boligmatchLogo2.png";
import ratingImg from "/src/assets/userImages/rating.png";
import fullRatingImg from "/src/assets/userImages/ratig2.png";
import servicesImg from "/src/assets/supplierProfile/services.png";
import factsImg from "/src/assets/userImages/faktaLogo.svg";
import kabelLogoImg from "/src/assets/userImages/kabelLogoImg.png";
import startImg from "/src/assets/userImages/star.png";
import { useTranslation } from "react-i18next";

function PartnerProfileShortcut({
  partnerData: initialPartnerData,
}: {
  partnerData?: any;
}) {
  const { t } = useTranslation();
  const [partnerData, setPartnerData] = useState<any>(
    initialPartnerData || null
  );

  const reviews: any[] = Array.isArray(partnerData?.testImo)
    ? partnerData.testImo.filter((r: any) => r && r.isDisplayed)
    : [];

  const getCurrentPartnerId = (): number | null => {
    try {
      const stored = localStorage.getItem("bm_partner");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const candidate = parsed?.partnerId ?? parsed?.id;
      const id = Number(candidate);
      return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
      return null;
    }
  };

  const getServices = () => {
    if (!partnerData?.textField3) return [];
    const raw = String(partnerData.textField3 || "");
    const normalized = raw.replace(/<\/?br\s*\/?>(\r?\n)?/gi, "\n");
    return normalized
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .map((s: string) => s.replace(/^•\s*/, ""));
  };

  const getReferences = () => {
    if (!partnerData?.textField4) return [];
    return partnerData.textField4
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  };

  const renderRating = (
    rating: number,
    sizeClass: string,
    gapClass = "gap-1"
  ) => {
    const items = Array.from({ length: 5 }, (_, i) => {
      const src = i < rating ? ratingImg : fullRatingImg;
      return (
        <img
          key={i}
          src={src}
          alt="rating"
          className={`${sizeClass} select-none`}
        />
      );
    });
    return <div className={`flex items-center ${gapClass}`}>{items}</div>;
  };

  useEffect(() => {
    const partnerId = getCurrentPartnerId();
    if (!partnerId) {
      return;
    }

    const fetchPartner = async () => {
      try {
        const response = await partnerService.getById(partnerId);
        setPartnerData((response as any)?.output ?? response);
      } catch (error) {
        console.error("Error fetching partner profile", error);
      }
    };

    fetchPartner();
  }, []);

  return (
    <>
      <div className="w-full mx-auto -mt-8 md:-mt-10">
        <div className="w-full h-[52vh] md:h-[70vh] lg:h-[80vh] overflow-hidden shadow-lg">
          <img
            src={partnerData?.thumbnail}
            alt="Partner Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="bg-[#01351f]">

        <div className=" p-4 md:p-8">
          <div className="text-center">
            <h2 className="text-[32px] md:text-4xl lg:text-[64px] font-[800] text-white mb-2">
              {partnerData?.businessName || "Business Name"}
            </h2>
            <p className="text-white font-[400] text-sm md:text-base lg:text-[18px] max-w-7xl mx-auto leading-normal px-4 md:px-0">
              {partnerData?.descriptionShort || "descriptionShort "}
            </p>
          </div>
        </div>

        <div className="  min-h-screen flex justify-center items-center p-8">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4 max-w-7xl">
            {/* Trustpilot Section */}
            <div className="flex flex-col gap-6">
              <div className="md:w-[403px] w-full md:h-[859px] h-auto rounded-[10px] bg-white p-6 flex flex-col relative">
                <div className=" flex justify-center p-2">
                  <img
                    className="w-[130px] h-[32px]"
                    src={trustPilotLogo}
                    alt=""
                  />
                </div>
                <h3 className="text-[32px] font-[800] mb-5 text-center">
                  {t("supplierProfile.reviewsTitle")}
                </h3>
                <div className="space-y-10">
                  {reviews.length > 0 ? (
                    reviews.map((rev: any) => {
                      const r = Math.max(
                        0,
                        Math.min(5, Number(rev?.rating) || 0)
                      );
                      return (
                        <div key={rev.id} className="">
                          <div className="flex justify-center mb-3">
                            {renderRating(r, "w-[45px] h-[42px]", "gap-2")}
                          </div>
                          <p className="text-[14px] italic text-[#000000] leading-relaxed text-start font-[500] px-6 line-clamp-3">
                            ”{rev?.test}”
                          </p>
                          <p className="text-sm font-bold text-black mt-3 text-start px-6">
                            {rev?.customerName}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-semibold text-black mt-3">
                      Ingen anmeldelser endnu.
                    </p>
                  )}
                </div>

                <div className="left-[25%] flex justify-center pt-2 mt-auto">
                  <button className="absolute w-[202px] h-[66px] bg-[#95C11F] flex items-center justify-center gap-2 text-white rounded-[11px] px-4 text-[20px] font-semibold figtree cursor-pointer opacity-100 leading-tight -mt-[10px]">
                    <img
                      src={startImg}
                      alt="rating"
                      className="w-[33px] h-[33px] select-none"
                    />
                    Anmeld os på Trustpilot
                  </button>
                </div>
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto mt-[30px] rounded-[10px] flex justify-center items-center"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                }}
              >
                <div
                  className="relative flex flex-col items-center justify-center"
                  style={{
                    width: "300px",
                    height: "300px",
                    backgroundImage:
                      "url('/src/assets/userImages/circlePartner.svg')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  <h2 className="text-white text-center text-[22px] font-semibold leading-tight">
                    Geografisk <br /> område
                  </h2>
                  <div className="max-w-[151px]">
                    <p className="text-white text-center text-[16px] pt-4 leading-tight">
                      {partnerData?.textField5}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col gap-6">
              <div className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] overflow-hidden">
                <img
                  src={partnerData?.imageUrl2}
                  alt={partnerData?.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] p-[53px_34px] gap-[10px] flex flex-col items-center justify-start"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%), linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
                }}
              >
                <img
                  src={servicesImg}
                  alt="Services"
                  className="w-[88px] h-[77px] select-none"
                />

                <h2 className="text-white text-[28px] font-[700] py-4">
                  Services
                </h2>

                <ul className="text-white list-none space-y-2 w-full">
                  {getServices().length > 0 ? (
                    getServices().map((service: string, idx: number) => (
                      <p
                        key={idx}
                        className="relative pl-5 line-clamp-2 overflow-hidden"
                      >
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        {service}
                      </p>
                    ))
                  ) : (
                    <>
                      <li className="relative pl-5">
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        Løsning af fejl og fejlfinding
                      </li>
                      <li className="relative pl-5">
                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                        Intelligente hjemsystemer
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-[#0E3E38] rounded-2xl p-6 md:w-[403px] w-full md:h-[432px] h-auto">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <img src="/src/assets/supplierProfile/gallery.png" alt="" />
                  <h3 className="text-3xl font-semibold text-white py-4">
                    Referencer
                  </h3>
                </div>
                <div className="text-white">
                  {getReferences().length > 0 ? (
                    getReferences().map((ref: string, idx: number) => (
                      <p key={idx} className="mb-1">
                        {ref}
                      </p>
                    ))
                  ) : (
                    <p>{partnerData?.textField4}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[10px] md:w-[403px] w-full md:h-[432px] h-auto flex justify-center items-center">
                <div className="text-center">
                  <img
                    src={partnerData?.logoUrl || kabelLogoImg}
                    alt={partnerData?.businessName}
                    className="w-[177px] h-[164px] object-contain mx-auto"
                  />

                  <h2 className="font-extrabold text-[30px] leading-[76px] text-black text-center">
                    {partnerData?.businessName ||
                      partnerData?.fullName ||
                      "Kabel-specialisten"}
                  </h2>
                </div>
              </div>

              <div
                className="md:w-[403px] w-full md:h-[432px] h-auto rounded-[10px] flex flex-col items-center gap-[10px] p-[53px_34px]"
                style={{
                  background:
                    "linear-gradient(135.54deg, #041412 1.6%, rgba(1, 52, 37, 0.86) 89.27%)",
                }}
              >
                <img
                  src={factsImg}
                  alt="Fakta"
                  className="w-[59px] h-[63px] select-none"
                />

                <h2 className="text-white text-[28px] font-[700] py-4">Fakta</h2>

                <div className="text-white text-sm space-y-2 w-full">
                  {partnerData?.textField2 && (
                    <div
                      className="text-left"
                      dangerouslySetInnerHTML={{
                        __html: partnerData.textField2,
                      }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="rounded-[10px] flex justify-center items-center overflow-hidden md:w-[403px] w-full md:h-[432px] h-auto">
                <img
                  src={
                    partnerData?.imageUrl3 ||
                    "/src/assets/userImages/subcategoryDetailImg.png"
                  }
                  alt="Work"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PartnerProfileShortcut;
