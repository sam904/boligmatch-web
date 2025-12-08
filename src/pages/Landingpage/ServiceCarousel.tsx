import { useState, useEffect, useRef } from "react";
import type { WheelEvent } from "react";
import { motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
// import { ChevronLeft, ChevronRight } from "lucide-react";
import swaperImg1 from "/src/assets/userImages/swiper5.svg";
import swaperImg2 from "/src/assets/userImages/swiper4.svg";
import swaperImg3 from "/src/assets/userImages/swiper1.svg";
import swaperImg4 from "/src/assets/userImages/swiper2.svg";
import swaperImg5 from "/src/assets/userImages/swiper3.svg";
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

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const wheelCooldownRef = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const wheelDeltaRef = useRef(0);
  const wheelThrottleRef = useRef<number | null>(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isHovered || isDragging) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 2800);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered, isDragging]);

  useEffect(
    () => () => {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      if (wheelThrottleRef.current !== null) {
        cancelAnimationFrame(wheelThrottleRef.current);
      }
    },
    []
  );

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = services.length - 1;
      if (nextIndex >= services.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleDrag = (_: any, info: any) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (_: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (Math.abs(swipe) > swipeConfidenceThreshold) {
      if (swipe > 0) {
        paginate(-1); // Swipe right, go to previous
      } else {
        paginate(1); // Swipe left, go to next
      }
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    // Accumulate wheel delta for smoother scrolling
    wheelDeltaRef.current += event.deltaY;
    
    // Use requestAnimationFrame for ultra-smooth frame-synced updates
    if (wheelThrottleRef.current === null) {
      wheelThrottleRef.current = requestAnimationFrame(() => {
        const threshold = 30; // Lower threshold for more responsive scrolling
        
        if (Math.abs(wheelDeltaRef.current) >= threshold) {
          if (!wheelCooldownRef.current) {
            wheelCooldownRef.current = true;
            setIsManualScroll(true);
            paginate(wheelDeltaRef.current > 0 ? 1 : -1);
            
            // Reset cooldown faster for smoother continuous scrolling
            if (manualScrollTimeoutRef.current) {
              clearTimeout(manualScrollTimeoutRef.current);
            }
            manualScrollTimeoutRef.current = setTimeout(() => {
              wheelCooldownRef.current = false;
              setIsManualScroll(false);
            }, 500); // Reduced from 800ms for faster response
          }
        }
        
        wheelDeltaRef.current = 0;
        wheelThrottleRef.current = null;
      });
    }
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
        <motion.div
          className="relative w-full max-w-[1600px] h-full flex items-center justify-center px-4"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onWheel={handleWheel}
          onDragStart={() => {
            setIsDragging(true);
            setDragOffset(0);
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {getVisibleCards().map((service) => {
            const position = service.position;
            const isCurrent = position === 0;
            const absPosition = Math.abs(position);

            // Calculate scale and opacity based on distance from center
            const scale = isCurrent ? 1 : absPosition === 1 ? 0.85 : 0.75;
            const opacity = 1;

            // Responsive card spacing
            const cardSpacing = isMobile ? 240 : 280;

            // Calculate x position with drag offset for smooth motion
            const baseX = position * cardSpacing;
            const dragInfluence = isDragging ? dragOffset : 0;
            const finalX = baseX + dragInfluence;

            return (
              <motion.div
                key={`${service.id}-${position}`}
                className="absolute"
                initial={false}
                animate={{
                  x: finalX,
                  scale: scale,
                  opacity: opacity,
                  zIndex: 20 - absPosition * 5,
                }}
                transition={
                  isDragging
                    ? { type: "spring", stiffness: 300, damping: 30 }
                    : isManualScroll
                    ? { 
                        type: "spring", 
                        stiffness: 150, 
                        damping: 20,
                        mass: 0.6,
                        velocity: 0
                      }
                    : {
                        type: "tween",
                        duration: 0.7,
                        ease: "easeInOut",
                      }
                }
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
        </motion.div>
      </div>
    </div>
  );
}





