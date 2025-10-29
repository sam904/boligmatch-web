import React from "react";
import { useTranslation } from "react-i18next";
import swaperImg1 from "/src/assets/userImages/swiper5.png";
import swaperImg2 from "/src/assets/userImages/swiper4.png";
import swaperImg3 from "/src/assets/userImages/swiper1.png";
import swaperImg4 from "/src/assets/userImages/swiper2.png";
import swaperImg5 from "/src/assets/userImages/swiper3.png";
import swaperIcons1 from "/src/assets/userImages/swaperIcon1.svg";
import swaperIcons2 from "/src/assets/userImages/swaperIcon2.svg";
import swaperIcons3 from "/src/assets/userImages/swaperIcon3.svg";
import swaperIcons4 from "/src/assets/userImages/swaperIcon4.svg";
import swaperIcons5 from "/src/assets/userImages/swaperIcon5.svg";

const ServiceCarousel: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 1,
      title: t("services.moving.title"),
      description: t("services.moving.description"),
      icon: swaperIcons1,
      backgroundImage: swaperImg1,
      color: "#4A90E2",
    },
    {
      id: 2,
      title: t("services.construction.title"),
      description: t("services.construction.description"),
      icon: swaperIcons2,
      backgroundImage: swaperImg2,
      color: "#50E3C2",
    },
    {
      id: 3,
      title: t("services.craftsmen.title"),
      description: t("services.craftsmen.description"),
      icon: swaperIcons3,
      backgroundImage: swaperImg3,
      color: "#F5A623",
    },
    {
      id: 4,
      title: t("services.interior.title"),
      description: t("services.interior.description"),
      icon: swaperIcons4,
      backgroundImage: swaperImg4,
      color: "#BD10E0",
    },
    {
      id: 5,
      title: t("services.consulting.title"),
      description: t("services.consulting.description"),
      icon: swaperIcons5,
      backgroundImage: swaperImg5,
      color: "#7ED321",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#043428] flex flex-col items-center justify-center overflow-x-hidden py-16 md:py-10 px-0 m-0">
      <div className="flex items-center justify-center w-full px-2">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={`relative overflow-hidden flex-shrink-0 w-[359px] h-[515px] rounded-[25px] transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
              ${index === 2 
                ? 'scale-105 z-20 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255)]' 
                : ''
              }
              ${index < 2 
                ? 'scale-95 -mr-20 z-10 opacity-90' 
                : ''
              }
              ${index > 2 
                ? 'scale-95 -ml-20 z-10 opacity-90' 
                : ''
              }
              shadow-[0_15px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]`}
            style={{
              backgroundImage: `url(${service.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[rgba(4,52,40,0.8)] to-transparent z-[1]"></div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center text-center z-[2] py-8 px-6 md:py-6 md:px-5 sm:py-5 sm:px-4">
              <div className={`w-14 h-14 md:w-12 md:h-12 sm:w-11 sm:h-11 flex items-center justify-center mb-5 md:mb-4 relative z-[2] transition-all duration-300 ${index === 2 ? 'scale-110' : ''}`}>
                <img 
                  src={service.icon} 
                  alt={service.title}
                  className="w-full h-full brightness-0 invert drop-shadow-[2px_2px_6px_rgba(0,0,0,0.3)]"
                />
              </div>
              <h3 className="text-[1.3rem] md:text-[1.1rem] sm:text-base font-bold text-white mb-4 md:mb-3 sm:mb-3 leading-[1.3] -tracking-[0.2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {service.title}
              </h3>
              <p className="text-sm md:text-[0.85rem] sm:text-[0.8rem] text-white/90 leading-6 md:leading-[1.4] m-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCarousel;
