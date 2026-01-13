import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import swaperImg1 from "/src/assets/userImages/swiper5.png";
import swaperImg2 from "/src/assets/userImages/swiper4.png";
import swaperImg3 from "/src/assets/userImages/swiper1.png";
import swaperImg4 from "/src/assets/userImages/swiper2.png";
import swaperImg5 from "/src/assets/userImages/carousel2.png";
import swaperImg6 from "/src/assets/userImages/swiper6.png";
import swaperImg7 from "/src/assets/userImages/swaperImg7.png";
import swaperImg8 from "/src/assets/userImages/swaperImg8.png";
import swaperImg9 from "/src/assets/userImages/swaperImg9.png";
import swaperIcons1 from "/src/assets/userImages/swaperIcon1.svg";
import swaperIcons2 from "/src/assets/userImages/swaperIcon2.svg";
import swaperIcons3 from "/src/assets/userImages/swaperIcon3.svg";
import swaperIcons4 from "/src/assets/userImages/swaperIcon4.svg";
import swaperIcons5 from "/src/assets/userImages/swaperIcon5.svg";
import swaperIcons6 from "/src/assets/userImages/swaperIcons6.svg";
import swaperIcons7 from "/src/assets/userImages/swaperIcons7.svg";
import swaperIcons8 from "/src/assets/userImages/swaperIcons8.svg";
import swaperIcons9 from "/src/assets/userImages/swaperIcons9.svg";

export default function ServiceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const IMAGES = [swaperImg1, swaperImg2, swaperImg3, swaperImg4, swaperImg5, swaperImg6, swaperImg7, swaperImg8, swaperImg9];
  const TOTAL_ITEMS = IMAGES.length;

  const isMobile = window.innerWidth < 768;

  // Get visible items (5 items centered around currentIndex)
  const getVisibleItems = () => {
    const visibleIndices = [];
    for (let i = -2; i <= 2; i++) {
      let index = currentIndex + i;
      if (index < 0) {
        index = TOTAL_ITEMS + index; // Wrap to end
      } else if (index >= TOTAL_ITEMS) {
        index = index % TOTAL_ITEMS; // Wrap to beginning
      }
      visibleIndices.push(index);
    }
    return visibleIndices;
  };

  const visibleItems = getVisibleItems();

  const POSITIONS = ["left", "left1", "center", "right1", "right"] as const;

  // Responsive position map
  const IMAGE_VARIANTS = {
    center: { x: "0%", scale: isMobile ? 1 : 1.05, zIndex: 5, opacity: 1 },
    left1: { x: isMobile ? "-75%" : "-92%", scale: isMobile ? 0.90 : 0.94, zIndex: 3, opacity: 1 },
    left: { x: isMobile ? "-140%" : "-168%", scale: isMobile ? 0.84 : 0.88, zIndex: 2, opacity: 1 },
    right: { x: isMobile ? "140%" : "168%", scale: isMobile ? 0.84 : 0.88, zIndex: 2, opacity: 1 },
    right1: { x: isMobile ? "75%" : "92%", scale: isMobile ? 0.90 : 0.94, zIndex: 3, opacity: 1 },
  };

  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 500;

  const SERVICES = [
    {
      id: 1,
      title: "Flytning og opbevaring",
      description: "Flytning, opbevaring",
      icon: swaperIcons5,
    },
    {
      id: 2,
      title: "Byg og anlæg",
      description: "Tag og facade, port og hegn, kloak og jord, bortskaffelse, stillads",
      icon: swaperIcons4,
    },
    {
      id: 3,
      title: "Håndværkere",
      description:
        "Tømrer, murer, elektriker, VVS, maler, glarmester, handyman, fugemand, isolering",
      icon: swaperIcons3,
    },
    {
      id: 4,
      title: "Indretning",
      description:
        "Køkken, bad, gulv, tæpper, gardiner og markiser",
      icon: swaperIcons2,
    },
    {
      id: 5,
      title: "Rådgivning",
      description:
        "Arkitekt, byggerådgivning, advokat, forsikring, bank, indretningsarkitekt",
      icon: swaperIcons1,
    },
    {
      id: 6,
      title: "Hus og have",
      description:
        "Skadesservice, alarm og sikring, skadedyrsbekæmpelse, anlægsgartner, gartner, pool og spa",
      icon: swaperIcons6,
    },
    {
      id: 7,
      title: "Rengøring og vedligehold",
      description:
        "Rengøring, vinduespolering, tag- og fliserens",
      icon: swaperIcons7,
    },
    {
      id: 8,
      title: "Energi og opvarmning",
      description:
        "EL-forsyning, solceller",
      icon: swaperIcons8,
    },
    {
      id: 9,
      title: "Fritid",
      description:
        "Biler, cykler",
      icon: swaperIcons9,
    },
  ];


  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TOTAL_ITEMS);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > VELOCITY_THRESHOLD) {
      info.offset.x > 0 ? handlePrev() : handleNext();
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isHovered || isDragging) {
      clearInterval(autoSlideRef.current || 0);
      return;
    }

    autoSlideRef.current = setInterval(handleNext, 2000);
    return () => clearInterval(autoSlideRef.current || 0);
  }, [isHovered, isDragging]);


  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-[#01351f] h-[60vh] md:h-[90vh] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full max-w-6xl mx-auto flex justify-center items-center h-full">
        <div ref={carouselRef} className="relative w-full flex justify-center items-center h-full">
          {visibleItems.map((itemIndex, positionIndex) => {
            const position = POSITIONS[positionIndex];
            const currentService = SERVICES[itemIndex];

            return (
              <motion.div
                key={itemIndex}
                className="absolute rounded-3xl shadow-xl cursor-grab overflow-hidden"
                animate={position}
                variants={IMAGE_VARIANTS}
                transition={{ duration: 0.5 }}
                drag="x"
                dragElastic={0.2}
                onDragStart={() => {
                  setIsDragging(true);
                }}
                onDragEnd={handleDragEnd}
                style={{
                  width: "clamp(300px, 70vw, 360px)",
                  height: "clamp(440px, 80vw, 520px)",
                  touchAction: "pan-y pinch-zoom",
                }}
              >
                <img
                  src={IMAGES[itemIndex]}
                  className="w-full h-full object-cover rounded-3xl"
                  draggable="false"
                  alt={currentService.title}
                />

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 md:pb-12 bg-gradient-to-t from-black/40 to-transparent rounded-b-3xl text-center">
                  <img src={currentService.icon} className="w-12 h-12 mx-auto mb-2" alt="icon" />
                  <h3 className="text-white text-xl font-semibold">{currentService.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{currentService.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>



      {/* Navigation Dots */}
      {/* <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        {renderNavigationDots()}
      </div> */}
    </div>
  );
}