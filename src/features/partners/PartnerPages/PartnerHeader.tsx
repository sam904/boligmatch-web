import { useState, useEffect } from "react";
import userLogo from "/src/assets/userImages/footerLogo.svg";
import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";

function PartnerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className=" relative">
        <div
          className={`fixed top-0 left-0 right-0 h-16 sm:h-18 md:h-20 px-4 sm:px-6 md:px-8 lg:px-12 z-50 transition-colors duration-300 ${
            isScrolled ? "bg-[#06351E]" : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="">
              <img
                className={`duration-300 cursor-pointer ${
                  isScrolled ? "h-8 sm:h-9 md:h-10" : "h-10 sm:h-11 md:h-12"
                }`}
                src={userLogo}
                alt="Boligmatch Logo"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button className="p-1 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <img
                  src={userHeaderHamburger}
                  alt="Menu"
                  className={`duration-300 cursor-pointer ${
                    isScrolled ? "h-5 sm:h-6" : "h-6 sm:h-7 md:h-8"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default PartnerHeader;
