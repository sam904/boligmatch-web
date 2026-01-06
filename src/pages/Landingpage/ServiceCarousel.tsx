import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function ServiceCarousel() {
  const [positionIndexes, setPositionIndexes] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeDragIndexRef = useRef<number | null>(null);

  const IMAGES = [swaperImg1, swaperImg2, swaperImg3, swaperImg4, swaperImg5];

  const isMobile = window.innerWidth < 768;

  const POSITIONS = ["center", "left1", "left", "right", "right1"] as const;

  // Responsive position map
  const IMAGE_VARIANTS = {
    center: { x: "0%", scale: isMobile ? 1 : 1.05, zIndex: 5 },
    left1: { x: isMobile ? "-75%" : "-92%", scale: isMobile ? 0.90 : 0.94, zIndex: 3 },
    left: { x: isMobile ? "-140%" : "-168%", scale: isMobile ? 0.84 : 0.88, zIndex: 2 },
    right: { x: isMobile ? "140%" : "168%", scale: isMobile ? 0.84 : 0.88, zIndex: 2 },
    right1: { x: isMobile ? "75%" : "92%", scale: isMobile ? 0.90 : 0.94, zIndex: 3 },
  };

  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 500;

  const SERVICES = [
    {
      id: 1,
      title: "Flytning og opbevaring",
      description: "Olore dolupta tquatet magnimus eos etus vel et molut quis coratem hilicae vele",
      icon: swaperIcons5,
    },
    {
      id: 2,
      title: "Byg og anlæg",
      description: "Eque illecus quunt ut volorit ut volore eum volore quatemperis quam erum et ut",
      icon: swaperIcons4,
    },
    {
      id: 3,
      title: "Håndværkere",
      description: "Tømrer, murer, elektriker, VVS, maler, glarmester, handyman, fugemand",
      icon: swaperIcons3,
    },
    {
      id: 4,
      title: "Indretning",
      description: "cus quunt ut volorit ut volore eum volore quatemperis quam erum et ut",
      icon: swaperIcons2,
    },
    {
      id: 5,
      title: "Rådgivning",
      description: "dolupta tquatet magnimus eos etus vel et molut quis coratem hilicae velectu",
      icon: swaperIcons1,
    },
  ];

  const handleNext = () => {
    setPositionIndexes((prev) => prev.map((i) => (i + 1) % IMAGES.length));
  };

  const handlePrev = () => {
    setPositionIndexes((prev) => prev.map((i) => (i + IMAGES.length - 1) % IMAGES.length));
  };

  const handleDragEnd = (_index: number, _: any, info: any) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > VELOCITY_THRESHOLD) {
      info.offset.x > 0 ? handlePrev() : handleNext();
    }
    setIsDragging(false);
    activeDragIndexRef.current = null;
  };

  useEffect(() => {
    if (isHovered || isDragging) return clearInterval(autoSlideRef.current || 0);

    autoSlideRef.current = setInterval(handleNext, 3000);
    return () => clearInterval(autoSlideRef.current || 0);
  }, [isHovered, isDragging]);

  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-[#01351f] h-[60vh] md:h-[90vh] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={carouselRef} className="relative w-full  flex justify-center items-center">
        {IMAGES.map((image, index) => {
          const position = POSITIONS[positionIndexes[index]];
          const currentService = SERVICES[index];

          return (
            <motion.div
              key={index}
              className="absolute rounded-3xl shadow-xl  cursor-grab"
              animate={position}
              variants={IMAGE_VARIANTS}
              transition={{ duration: 0.5 }}
              drag="x"
              dragElastic={0.2}
              onDragStart={() => {
                setIsDragging(true);
                activeDragIndexRef.current = index;
              }}
              onDragEnd={(e, info) => handleDragEnd(index, e, info)}
              style={{
                width: "clamp(300px, 70vw, 360px)",
                height: "clamp(440px, 80vw, 520px)",
                touchAction: "pan-y pinch-zoom",
              }}
            >
              <img
                src={image}
                className="w-full h-full object-cover rounded-3xl"
                draggable="false"
              />

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 md:pb-12 bg-gradient-to-t from-black/40 to-transparent rounded-b-3xl text-center">
                <img src={currentService.icon} className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-white text-xl font-semibold">{currentService.title}</h3>
                <p className="text-white/80 text-sm mt-1">{currentService.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
}
