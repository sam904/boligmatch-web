import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "./style.css";
import swaperImg1 from "/src/assets/userImages/swapperImg.png";
import swaperImg2 from "/src/assets/userImages/swaperImg2.png";
import swaperImg3 from "/src/assets/userImages/swaperImg3.png";
import swaperImg4 from "/src/assets/userImages/swaperImg4.png";
import swaperImg5 from "/src/assets/userImages/swaperImg5.png";
import swaperIcons1 from "/src/assets/userImages/swaperIcon1.svg";
import swaperIcons2 from "/src/assets/userImages/swaperIcon2.svg";
import swaperIcons3 from "/src/assets/userImages/swaperIcon3.svg";
import swaperIcons4 from "/src/assets/userImages/swaperIcon4.svg";
import swaperIcons5 from "/src/assets/userImages/swaperIcon5.svg";

const ServiceCarousel: React.FC = () => {
  const services = [
    {
      id: 1,
      title: "Flytning og opbevaring",
      description: "Close doluptatquetet magnimu",
      icon: swaperIcons1,
      backgroundImage: swaperImg1,
      color: "#4A90E2",
    },
    {
      id: 2,
      title: "Byg og anlæg",
      description: "Eque llecus quunt ut volorutut",
      icon: swaperIcons2,
      backgroundImage: swaperImg2,
      color: "#50E3C2",
    },
    {
      id: 3,
      title: "Håndværkeresdsds",
      description:
        "Tømrer, murer, elektriker, VVS, maler, glarmester, handyman, fugemand",
      icon: swaperIcons3,
      backgroundImage: swaperImg3,
      color: "#F5A623",
    },
    {
      id: 4,
      title: "Indretning",
      description: "cuc quunt ut volorut ut voloreum",
      icon: swaperIcons4,
      backgroundImage: swaperImg4,
      color: "#BD10E0",
    },
    {
      id: 5,
      title: "Rådgivning",
      description: "dolupta tquatet magnimus ece",
      icon: swaperIcons5,
      backgroundImage: swaperImg5,
      color: "#7ED321",
    },
  ];

  return (
    <div className="services-carousel-container">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        initialSlide={3}
        coverflowEffect={{
          rotate: 0,
          stretch: -100, 
          depth: 100,
          modifier: 1.5,
          slideShadows: false,
        }}
        loop={true}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        modules={[EffectCoverflow, Autoplay, Navigation]}
        className="services-swiper"
        spaceBetween={-100}
      >
        {services.map((service) => (
          <SwiperSlide key={service.id}>
            <div
              className="service-card"
              style={{
                backgroundImage: `url(${service.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="service-overlay"></div>
              <div className="service-content">
                <div className="service-icon-container">
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className=""
                  />
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ServiceCarousel;
