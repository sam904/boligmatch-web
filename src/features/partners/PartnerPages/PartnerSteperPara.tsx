import partnerCartImg from "/src/assets/userImages/partnerCardImg.svg";
import sampleImg from "/src/assets/userImages/footerLogo.svg";
import { useTranslation } from "react-i18next";

function ParentSteperPara() {
  const { t } = useTranslation();
  const benefits = [
    {
      title: t("partnerSteperPara.benefits.1.title"),
      description: t("partnerSteperPara.benefits.1.description"),
    },
    {
      title: t("partnerSteperPara.benefits.2.title"),
      description: t("partnerSteperPara.benefits.2.description"),
    },
    {
      title: t("partnerSteperPara.benefits.3.title"),
      description: t("partnerSteperPara.benefits.3.description"),
    },
    {
      title: t("partnerSteperPara.benefits.4.title"),
      description: t("partnerSteperPara.benefits.4.description"),
    },
    {
      title: t("partnerSteperPara.benefits.5.title"),
      description: t("partnerSteperPara.benefits.5.description"),
    },
    {
      title: t("partnerSteperPara.benefits.6.title"),
      description: t("partnerSteperPara.benefits.6.description"),
    },
  ];
  return (
    <div className="bg-[#053628]">
      <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-0">
            <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  tracking-tight figtree">
              {t("partnerSteperPara.intro1")}
            </p>
            <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  mt-4 tracking-tight figtree">
              {t("partnerSteperPara.intro2")}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#053628] min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 figtree">
            {t("partnerSteperPara.heading")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 md:p-6 transition-colors duration-300 w-full h-full flex flex-col"
                style={{
                  background:
                    "linear-gradient(155.76deg, #041412 2.48%, #013425 97.87%)",
                  borderRadius: "10px",
                  opacity: 1,
                  minHeight: "350px",
                }}
              >
                <div className="mb-3 sm:mb-4 flex justify-center flex-shrink-0">
                  <img
                    src={partnerCartImg}
                    alt=""
                    className="h-[60px] w-[72px] sm:h-[70px] sm:w-[84px] md:h-[82px] md:w-[98px]"
                  />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3  text-center flex-shrink-0 figtree">
                  {benefit.title}
                </h3>
                <p className="text-white text-xs sm:text-sm leading-relaxed  text-center flex-grow figtree">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#043428] flex flex-col justify-center items-center py-8 sm:py-12 md:py-16 lg:py-22 space-y-2 px-4">
        <div className="text-center">
          <div className="mb-3 sm:mb-4">
            <img src={sampleImg} alt="Boligmatch Logo" className="h-auto w-auto max-w-[120px] sm:max-w-[150px] md:max-w-none" />
          </div>
        </div>
        <p className="text-white text-xs sm:text-sm text-center leading-relaxed">
          Teningve 7 2610 Rødovre<br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>Tlf <a href="tel:70228288" className="text-[#91C73D] hover:underline">70228288</a><br className="sm:hidden" />
          <span className="hidden sm:inline"> </span><a href="mailto:info@boligmatch.dk" className="text-[#91C73D] hover:underline">info@boligmatch.dk</a><br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>CVR 33160437
        </p>
      </div>
    </div>
  );
}

export default ParentSteperPara;
