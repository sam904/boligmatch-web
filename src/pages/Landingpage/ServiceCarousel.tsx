import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
// import { ChevronLeft, ChevronRight } from "lucide-react";
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

const services = [
  {
    id: 1,
    title: "Flytning og opbevarin",
    description:
      "Olore dolupta tquatet magnimus eos etus vel et molut quis coratem hilicae vele",
    icon: swaperIcons5,
    image: swaperImg1,
  },
  {
    id: 2,
    title: "Byg og anlæg",
    description:
      "Eque illecus quunt ut volorit ut volore eum volore quatemperis quam erum et ut",
    icon: swaperIcons4,
    image: swaperImg2,
  },
  {
    id: 3,
    title: "Håndværkere",
    description:
      "Tømrer, murer, elektriker, VVS, maler, glarmester, handyman, fugemand",
    icon: swaperIcons3,
    image: swaperImg3,
  },
  {
    id: 4,
    title: "ndretning",
    description:
      "cus quunt ut volorit ut volore eum volore quatemperis quam erum et ut",
    icon: swaperIcons2,
    image: swaperImg4,
  },
  {
    id: 5,
    title: "Rådgivning",
    description:
      "dolupta tquatet magnimus eos etus vel et molut quis coratem hilicae velectu",
    icon: swaperIcons1,
    image: swaperImg5,
  },
];

export default function ServiceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  console.log("direction", direction);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 2800); 

    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  // const slideVariants = {
  //   enter: (direction: number) => ({
  //     x: direction > 0 ? 1000 : -1000,
  //     opacity: 0,
  //     scale: 0.8,
  //   }),
  //   center: {
  //     zIndex: 1,
  //     x: 0,
  //     opacity: 1,
  //     scale: 1,
  //   },
  //   exit: (direction: number) => ({
  //     zIndex: 0,
  //     x: direction < 0 ? 1000 : -1000,
  //     opacity: 0,
  //     scale: 0.8,
  //   }),
  // };

  // const swipeConfidenceThreshold = 10000;
  // const swipePower = (offset: number, velocity: number) => {
  //   return Math.abs(offset) * velocity;
  // };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = services.length - 1;
      if (nextIndex >= services.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const isMobile = windowWidth < 1024;
  const visibleRange = isMobile ? 1 : 2;

  const getVisibleCards = () => {
    const cards = [];
    for (let i = -visibleRange; i <= visibleRange; i++) {
      let index = currentIndex + i;
      if (index < 0) index = services.length + index;
      if (index >= services.length) index = index - services.length;
      cards.push({ ...services[index], position: i });
    }
    return cards;
  };

  return (
    <div
      className="relative w-full overflow-hidden py-12 bg-[#01351f]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="relative h-[600px] md:h-[600px] flex items-center justify-center">
        {/* Cards */}
        <div className="relative w-full max-w-[1600px] h-full flex items-center justify-center px-4">
          {getVisibleCards().map((service, idx) => {
            const position = service.position;
            const isCurrent = position === 0;
            const absPosition = Math.abs(position);

            // Calculate scale and opacity based on distance from center
            const scale = isCurrent ? 1 : absPosition === 1 ? 0.85 : 0.75;
            const opacity = isCurrent ? 1 : absPosition === 1 ? 0.6 : 0.4;

            // Responsive card spacing
            const cardSpacing = isMobile ? 240 : 280;

            return (
              <motion.div
                key={`${service.id}-${currentIndex}`}
                className="absolute"
                initial={false}
                animate={{
                  x: position * cardSpacing,
                  scale: scale,
                  opacity: opacity,
                  zIndex: 20 - absPosition * 5,
                }}
                transition={{
                  type: "tween",
                  duration: 0.7,
                  ease: "easeInOut",
                }}
                style={{
                  width: isMobile ? "300px" : "360px",
                }}
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  image={service.image}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {/* <button
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      </button> */}

      {/* <button
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      </button> */}

      {/* Dots Indicator */}
      {/* <div className="flex justify-center gap-2 mt-8">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </div>
  );
}
