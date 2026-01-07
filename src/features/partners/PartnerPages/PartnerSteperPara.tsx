import ACP from "/src/assets/userImages/partnerSteperPara1.svg";
import visiblemarketing from "/src/assets/userImages/partnerSteperPara2.svg";
import focus from "/src/assets/userImages/partnerSteperPara3.svg";
import networkgroup from "/src/assets/userImages/partnerSteperPara4.svg";
import discount from "/src/assets/userImages/partnerSteperPara5.svg";
import reffer from "/src/assets/userImages/partnerSteperPara6.svg";
import PlayButton from "/src/assets/userImages/partnerSteperPara7.svg";
import share from "/src/assets/userImages/partnerSteperPara8.svg";
import star from "/src/assets/userImages/partnerSteperPara9.svg";
// import sampleImg from "/src/assets/userImages/footerLogo.svg";
import { useTranslation } from "react-i18next";
import Footer from "../../../pages/Footer";

function ParentSteperPara() {
  const { t } = useTranslation();
  const benefits = [
    {
      title: t("partnerSteperPara.benefits.1.title"),
      description: t("partnerSteperPara.benefits.1.description"),
      img: ACP
    },
    {
      title: t("partnerSteperPara.benefits.2.title"),
      description: t("partnerSteperPara.benefits.2.description"),
      img: visiblemarketing
    },
    {
      title: t("partnerSteperPara.benefits.3.title"),
      description: t("partnerSteperPara.benefits.3.description"),
      img: focus
    },
    {
      title: t("partnerSteperPara.benefits.4.title"),
      description: t("partnerSteperPara.benefits.4.description"),
      img: networkgroup
    },
    {
      title: t("partnerSteperPara.benefits.5.title"),
      description: t("partnerSteperPara.benefits.5.description"),
      img: discount
    },
    {
      title: t("partnerSteperPara.benefits.6.title"),
      description: t("partnerSteperPara.benefits.6.description"),
      img: reffer
    },
    {
      title: t("partnerSteperPara.benefits.7.title"),
      description: t("partnerSteperPara.benefits.7.description"),
      img: PlayButton
    },
    {
      title: t("partnerSteperPara.benefits.8.title"),
      description: t("partnerSteperPara.benefits.8.description"),
      img: share
    },
    {
      title: t("partnerSteperPara.benefits.9.title"),
      description: t("partnerSteperPara.benefits.9.description"),
      img: star
    },
  ];
  return (
    <div className="bg-[#01351F]">
      <div className="flex items-start justify-center px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-0 md:mt-10 pt-12 md:pt-0 md:mb-10">
            {/* <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  tracking-tight figtree">
              {t("partnerSteperPara.intro1")}
            </p> */}
            <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  mt-4 tracking-tight figtree">
              {t("partnerSteperPara.intro2")}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#01351F] min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 figtree">
            {t("partnerSteperPara.heading")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 md:p-6 transition-colors duration-300 w-full h-full flex flex-col"
                style={{
                  // background:
                  //   "linear-gradient(155.76deg, #041412 2.48%, #013425 97.87%)",
                  borderRadius: "10px",
                  opacity: 1,
                  minHeight: "350px",
                  // boxShadow: "0px 7px 16.6px 1px #00000040",
                }}
              >
                <div className="mb-3 sm:mb-4 flex justify-center flex-shrink-0">
                  <img
                    src={benefit.img}
                    alt=""
                    className="h-[60px] w-[72px] sm:h-[70px] sm:w-[84px] md:h-[82px] md:w-[98px]"
                  />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3  text-center flex-shrink-0 figtree">
                  {benefit.title}
                </h3>
                <p className="text-white md:text-md sm:text-sm leading-relaxed  text-center flex-grow figtree">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ParentSteperPara;
