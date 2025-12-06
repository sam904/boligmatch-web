import { useState, useEffect, useRef } from "react";
import type { WheelEvent, MouseEvent, TouchEvent } from "react";
import { motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
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
  const [_isManualScroll, setIsManualScroll] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [draggedCardIndex, setDraggedCardIndex] = useState<number | null>(null);
  
  const wheelCooldownRef = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRotateRef = useRef<number | null>(null); // Changed from NodeJS.Timeout
  const dragStartXRef = useRef(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    // Start auto-rotation immediately
    autoRotateRef.current = window.setInterval(() => { // Added window. prefix
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % services.length;
        return nextIndex;
      });
    }, 3000);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, []);

  // Pause auto-rotation on hover or drag
  useEffect(() => {
    if (isHovered || isDragging) {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    } else {
      // Resume auto-rotation when not hovering or dragging
      if (!autoRotateRef.current) {
        autoRotateRef.current = window.setInterval(() => { // Added window. prefix
          setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % services.length;
            return nextIndex;
          });
        }, 3000);
      }
    }
  }, [isHovered, isDragging]);

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, []);

  // Circular navigation functions
  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % services.length;
      return nextIndex;
    });
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => {
      const prev = prevIndex === 0 ? services.length - 1 : prevIndex - 1;
      return prev;
    });
  };

  // Handle wheel for carousel navigation
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (wheelCooldownRef.current) return;

    wheelCooldownRef.current = true;
    setIsManualScroll(true);
    
    if (event.deltaY > 0) {
      goToNext(); // Scroll down, go next
    } else {
      goToPrev(); // Scroll up, go previous
    }

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }
    manualScrollTimeoutRef.current = setTimeout(() => {
      wheelCooldownRef.current = false;
      setIsManualScroll(false);
    }, 600);
  };

  // Individual card drag handlers
  const handleCardDragStart = (position: number, clientX: number) => {
    if (position !== 0) return; // Only allow dragging the center card
    
    setIsDragging(true);
    setDraggedCardIndex(position);
    dragStartXRef.current = clientX;
    setDragOffset(0);
  };

  const handleCardDrag = (clientX: number) => {
    if (!isDragging || draggedCardIndex !== 0) return;
    
    const deltaX = clientX - dragStartXRef.current;
    setDragOffset(deltaX);
  };

  const handleCardDragEnd = () => {
    if (!isDragging || draggedCardIndex !== 0) return;
    
    const minSwipeDistance = 100; // Increased for better swipe detection
    
    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset > 0) {
        goToPrev(); // Drag right, go to previous
      } else {
        goToNext(); // Drag left, go to next
      }
    }
    
    setIsDragging(false);
    setDraggedCardIndex(null);
    setDragOffset(0);
    dragStartXRef.current = 0;
  };

  // Mouse events for desktop
  const handleMouseDown = (position: number, e: MouseEvent) => {
    if (position !== 0) return; // Only allow dragging the center card
    e.preventDefault();
    handleCardDragStart(position, e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleCardDrag(e.clientX);
  };

  const handleMouseUp = () => {
    handleCardDragEnd();
  };

  // Touch events for mobile
  const handleTouchStart = (position: number, e: TouchEvent) => {
    if (position !== 0) return; // Only allow dragging the center card
    handleCardDragStart(position, e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleCardDrag(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleCardDragEnd();
  };

  const isMobile = windowWidth < 1024;
  const visibleRange = isMobile ? 1 : 2;

  const getVisibleCards = () => {
    const cards = [];
    for (let i = -visibleRange; i <= visibleRange; i++) {
      let index = currentIndex + i;
      // Handle wrap-around for circular carousel
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    > {/* Removed onMouseLeaveCapture */}
      {/* Carousel Container */}
      <div className="relative h-[600px] md:h-[600px] flex items-center justify-center">
        {/* Cards Container - No drag on container, only individual cards */}
        <div
          className="relative w-full max-w-[1600px] h-full flex items-center justify-center px-4"
          onWheel={handleWheel}
          style={{ 
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {getVisibleCards().map((service) => {
            const position = service.position;
            const isCurrent = position === 0;
            const absPosition = Math.abs(position);
            const canDrag = isCurrent; // Only center card can be dragged

            // Calculate scale and opacity based on distance from center
            const scale = isCurrent ? 1 : absPosition === 1 ? 0.85 : 0.75;
            const opacity = isCurrent ? 1 : absPosition === 1 ? 0.9 : 0.7;

            // Responsive card spacing
            const cardSpacing = isMobile ? 240 : 280;

            // Calculate x position
            const baseX = position * cardSpacing;
            const dragInfluence = (isDragging && isCurrent) ? dragOffset : 0;
            const finalX = baseX + dragInfluence;

            // Add subtle rotation effect for side cards
            const rotateY = isCurrent ? 0 : position * 5;

            return (
              <motion.div
                key={`${service.id}-${position}-${currentIndex}`}
                className="absolute"
                initial={false}
                animate={{
                  x: finalX,
                  scale: scale,
                  opacity: opacity,
                  rotateY: rotateY,
                  zIndex: 20 - absPosition * 5,
                  filter: isCurrent ? 'none' : `blur(${absPosition * 0.5}px)`,
                }}
                transition={
                  isDragging && isCurrent
                    ? { 
                        type: "spring", 
                        stiffness: 200, 
                        damping: 25,
                      }
                    : {
                        type: "spring",
                        stiffness: 250,
                        damping: 25,
                        mass: 0.8
                      }
                }
                style={{
                  width: isMobile ? "300px" : "360px",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  cursor: canDrag ? (isDragging ? "grabbing" : "grab") : "default",
                }}
                // Mouse events for desktop
                onMouseDown={(e) => handleMouseDown(position, e)}
                // Touch events for mobile
                onTouchStart={(e) => handleTouchStart(position, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  style={{
                    transform: `rotateY(${rotateY}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    image={service.image}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}






