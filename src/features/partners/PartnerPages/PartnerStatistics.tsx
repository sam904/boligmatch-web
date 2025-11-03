import PartnerHeader from "./PartnerHeader";
import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
import Statistik from "/src/assets/userImages/Statistik.svg";
// import MinProfil from "/src/assets/userImages/MinProfil.svg";
import Partnere from "/src/assets/userImages/Search.svg";
import PartnerStatDetails from "./PartnerStatDetails";

function ParentStatistics() {
  return (
    <>
      <div
        className=" md:min-h-screen relative bg-cover bg-no-repeat bg-[position:center_30%] sm:bg-[position:center_28%] md:bg-center"
        style={{
          backgroundImage: `url(${parentStatisticsImg})`,
        }}
      >
        <PartnerHeader />

        <div className="flex flex-col">
          <div className=" flex items-center justify-center md:justify-start px-4 pt-16 pb-4 md:px-12 md:pt-6 md:pb-6 md:absolute md:top-24 md:left-12">
            <div className=" mx-auto text-white text-center md:text-left">
              <h1 className="text-[24px] md:text-[64px] font-[800] tracking-tight leading-tight mb-1 md:mb-3">
                Partner Dashboard
              </h1>
              <h2 className="text-[24px] md:text-[64px] font-[500] tracking-tight">
                Kabel-specialisten
              </h2>
            </div>
          </div>
          <div className="px-4 md:px-12 mt-3 md:mt-0 py-3 md:py-6 md:absolute md:bottom-0 md:left-0 md:right-0">
            <div className="flex flex-row flex-nowrap items-center justify-center md:justify-center gap-2 md:gap-0 md:space-x-8">
              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#07583A] text-white rounded-lg transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Statistik} alt="" />
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  Statistik
                </span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  {/* <img src={MinProfil} alt="" /> */}
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  Min profil
                </span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Partnere} alt="" />
                </div>
                <span className="text-[13px] md:text-[20px] font-medium">
                  Partnere
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <PartnerStatDetails />
    </>
  );
}

export default ParentStatistics;
