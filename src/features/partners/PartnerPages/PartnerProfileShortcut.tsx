import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
import PartnerHeader from "./PartnerHeader";
import Statistik from "/src/assets/userImages/Statistik.svg";
// import MinProfil from "/src/assets/userImages/Minprofil.svg";
import Partnere from "/src/assets/userImages/Search.svg";
import profileShortcut from "/src/assets/userImages/partnerShortcutImg2.png";
import heartIconsImg from "/src/assets/userImages/Lag_1.svg";
import commentImg from "/src/assets/userImages/comment.svg";
import shareIconsImg from "/src/assets/userImages/share.svg";

function PartnerProfileShortcut() {
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
          <div className="flex-1 w-full flex items-center justify-center md:justify-start px-4 pt-24 pb-4 md:px-12 md:pt-6 md:pb-6 md:absolute md:top-24 md:left-12">
            <div className="w-full max-w-7xl mx-auto text-white text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-[800] tracking-tight leading-tight mb-1 md:mb-3">
                Partner Dashboard
              </h1>
              <h2 className="text-lg md:text-2xl lg:text-4xl font-[500] tracking-tight">
                Kabel-specialisten
              </h2>
            </div>
          </div>
          <div className="px-4 md:px-12 mt-3 md:mt-0 py-3 md:py-6 md:absolute md:bottom-0 md:left-0 md:right-0">
            <div className="w-full max-w-7xl mx-auto flex flex-row items-center justify-center md:justify-center gap-2 md:gap-0 md:space-x-8">
              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#07583A] text-white rounded-lg transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Statistik} alt="" />
                </div>
                <span className="text-xs md:text-sm font-medium ">
                  Statistik
                </span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  {/* <img src={MinProfil} alt="" /> */}
                </div>
                <span className="text-xs md:text-sm font-medium ">
                  Min profil
                </span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Partnere} alt="" />
                </div>
                <span className="text-xs md:text-sm font-medium ">
                  Partnere
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:max-w-7xl mx-auto -mt-8 md:-mt-10 px-4 md:px-6">
        <div className="w-full h-[52vh] md:h-[70vh] lg:h-[80vh] rounded-2xl overflow-hidden shadow-lg">
          <img
            src={profileShortcut}
            alt="Partner Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Action Buttons and Company Name */}
      <div className="bg-[#043428] p-4 md:p-8">
        {/* Three Action Buttons */}
        <div className="w-full md:max-w-7xl mx-auto flex flex-row justify-center gap-3 md:gap-6 mb-6 md:mb-8 px-4 md:px-0">
          {/* Gem som favorit Button */}
          <button className="flex items-center space-x-2 md:space-x-3 px-2 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img src={heartIconsImg} alt="" />
            </div>
            <span className="text-xs md:text-sm font-medium ">
              Gem som favorit
            </span>
          </button>

          {/* Anbefal os til andre Button */}
          <button className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img src={shareIconsImg} alt="" />
            </div>
            <span className="text-xs md:text-sm font-medium ">
              Anbefal os til andre
            </span>
          </button>

          {/* Kontakt os Button */}
          <button className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img src={commentImg} alt="" />
            </div>
            <span className="text-xs md:text-sm font-medium ">Kontakt os</span>
          </button>
        </div>

        {/* Company Name */}
        <div className="text-center">
          <h2 className="text-[32px] md:text-4xl lg:text-[64px] font-[800] text-white ">
            Kabel-specialisten
          </h2>
          <p className="text-white font-[400] text-sm md:text-base lg:text-[18px] max-w-7xl mx-auto leading-normal px-4 md:px-0">
            Arumet latem. Cus, omnim dolorio nsequiasit dolestibusa nimperum
            laboria autem hilique peria quamus, in cum quuntia nectibea cores
          </p>
        </div>
      </div>
    </>
  );
}

export default PartnerProfileShortcut;
