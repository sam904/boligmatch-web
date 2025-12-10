import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Import images
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

// Types
type Position = "center" | "left1" | "left" | "right" | "right1";
type PositionMap = Record<Position, { x: string; scale: number; zIndex: number }>;
type ServiceItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export default function ServiceCarousel() {
  // State
  const [positionIndexes, setPositionIndexes] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeDragIndexRef = useRef<number | null>(null);

  // Constants
  const IMAGES = [swaperImg1, swaperImg2, swaperImg3, swaperImg4, swaperImg5] as const;
  const POSITIONS: Position[] = ["center", "left1", "left", "right", "right1"];
  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 500;
  const AUTO_SLIDE_INTERVAL = 3000;

  // Service data
  const SERVICES: ServiceItem[] = [
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

  // Position variants
  const IMAGE_VARIANTS: PositionMap = {
    center:  { x: "0%", scale: 1.05, zIndex: 5 },
    left1:   { x: "-92%", scale: 0.94, zIndex: 3 },
    left:    { x: "-168%", scale: 0.88, zIndex: 2 },
    right:   { x: "168%", scale: 0.88, zIndex: 2 },
    right1:  { x: "92%", scale: 0.94, zIndex: 3 },
  };

  // Get drag constraints based on position
  const getDragConstraints = (position: Position) => {
    switch(position) {
      case 'center': return { left: -150, right: 150 };
      case 'left1': return { left: -50, right: 100 };
      case 'right1': return { left: -100, right: 50 };
      case 'left': return { left: -30, right: 50 };
      case 'right': return { left: -50, right: 30 };
      default: return { left: -100, right: 100 };
    }
  };

  // Navigation handlers
  const handleNext = (): void => {
    setPositionIndexes(prevIndexes => 
      prevIndexes.map(index => (index + 1) % IMAGES.length)
    );
  };

  const handlePrev = (): void => {
    setPositionIndexes(prevIndexes => 
      prevIndexes.map(index => (index + IMAGES.length - 1) % IMAGES.length)
    );
  };

  // Enhanced drag end handler for all cards
  const handleDragEnd = (
    index: number,
    _: MouseEvent | TouchEvent | PointerEvent, 
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const offsetX = Math.abs(info.offset.x);
    const velocityX = Math.abs(info.velocity.x);
    const position = POSITIONS[positionIndexes[index]];
    
    // Adjust thresholds based on position
    let threshold = SWIPE_THRESHOLD;
    let velocityThreshold = VELOCITY_THRESHOLD;
    
    // Make it easier to swipe side cards
    if (position === 'left' || position === 'right') {
      threshold = 30;
      velocityThreshold = 300;
    } else if (position === 'left1' || position === 'right1') {
      threshold = 40;
      velocityThreshold = 400;
    }
    
    // Only process swipe if it meets threshold
    if (offsetX > threshold || velocityX > velocityThreshold) {
      if (info.offset.x > 0 || info.velocity.x > 0) {
        // Swipe right - go to previous
        handlePrev();
      } else {
        // Swipe left - go to next
        handleNext();
      }
    }
    
    setIsDragging(false);
    activeDragIndexRef.current = null;
  };

  // Drag start handler
  const handleDragStart = (index: number) => {
    setIsDragging(true);
    activeDragIndexRef.current = index;
  };

  // Auto slide effect
  useEffect(() => {
    if (isHovered || isDragging) {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
      return;
    }

    autoSlideRef.current = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isHovered, isDragging]);

  // Handle manual navigation with keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <div 
      className="w-full flex flex-col items-center justify-center bg-[#01351f] h-screen relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Service carousel"
    >
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative w-full h-full flex justify-center items-center"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Carousel Images */}
        {IMAGES.map((image, index) => {
          const position = POSITIONS[positionIndexes[index]];
          const currentService = SERVICES[index];
          const isActiveDrag = activeDragIndexRef.current === index;
          
          return (
            <motion.div
              key={`carousel-item-${index}`}
              className="absolute rounded-[12px] !shadow-2xl !shadow-black cursor-grab active:cursor-grabbing"
              initial="center"
              animate={position}
              variants={IMAGE_VARIANTS}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              // Enable drag for ALL cards
              drag="x"
              dragConstraints={getDragConstraints(position)}
              dragElastic={0.2}
              dragMomentum={true}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={(e, info) => handleDragEnd(index, e, info)}
              whileTap={{ scale: 0.95 }}
              style={{ 
                touchAction: "pan-y pinch-zoom",
                width: "359px",
                height: "515px",
              }}
              role="group"
              aria-label={`Slide ${index + 1} of ${IMAGES.length}: ${currentService?.title || 'Service'}`}
              tabIndex={0}
            >
              {/* Image */}
              <motion.img
                src={image}
                alt={`Visual representation for ${currentService?.title || 'service'} slide`}
                className="w-full h-full object-cover rounded-3xl select-none"
                draggable="false"
                style={{
                  filter: isDragging && isActiveDrag ? "brightness(0.9)" : "brightness(1)",
                  transition: isDragging ? "filter 0.2s" : "filter 0.3s",
                  userSelect: "none",
                  WebkitUserDrag: "none",
                  // Add opacity for side cards when dragging
                  opacity: isDragging && position !== 'center' ? 0.9 : 1,
                } as React.CSSProperties}
              />
              
              {/* Service Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/40 to-transparent rounded-b-[12px]">
                {currentService && (
                  <>
                    <div className="flex flex-col items-center justify-center gap-2 mb-2">
                      <img 
                        src={currentService.icon} 
                        alt="" 
                        className="w-14 h-14"
                        aria-hidden="true"
                      />
                      <h3 className="text-white font-semibold text-2xl">
                        {currentService.title}
                      </h3>
                    </div>
                    <p className="text-white/80 text-md text-center">
                      {currentService.description}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Optional Navigation Buttons (for accessibility) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={handlePrev}
          className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}