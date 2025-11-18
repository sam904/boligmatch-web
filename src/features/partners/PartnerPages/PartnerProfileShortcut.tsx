// import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
// import PartnerHeader from "./PartnerHeader";
// import Statistik from "/src/assets/userImages/Statistik.svg";
// import MinProfil from "/src/assets/userImages/Minprofil.svg";
// import Partnere from "/src/assets/userImages/Search.svg";
// import profileShortcut from "/src/assets/userImages/partnerShortcutImg2.png";
// import heartIconsImg from "/src/assets/userImages/Lag_1.svg";
// import commentImg from "/src/assets/userImages/comment.svg";
// import shareIconsImg from "/src/assets/userImages/share.svg";

import Footer from "../../../pages/Footer";

function PartnerProfileShortcut({ partnerData }: { partnerData: any }) {
  return (
    <>
      <div className="w-full mx-auto -mt-8 md:-mt-10">
        <div className="w-full h-[52vh] md:h-[70vh] lg:h-[80vh] overflow-hidden shadow-lg">
          <img
            src={partnerData?.thumbnail}
            alt="Partner Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-[#01351f] p-4 md:p-8">
        {/* <div className="w-full flex flex-row justify-center gap-3 md:gap-6 mb-6 md:mb-8 px-4 md:px-0">
          <button className="flex items-center space-x-2 md:space-x-3 px-2 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img
                src={heartIconsImg}
                alt=""
                className="text-[13px] md:text-[20px] "
              />
            </div>
            <span className="text-[13px] md:text-[20px]  font-medium ">
              Gem som favorit
            </span>
          </button>

          <button className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img
                src={shareIconsImg}
                alt=""
                className="text-[13px] md:text-[20px] "
              />
            </div>
            <span className="text-[13px] md:text-[20px]  font-medium ">
              Anbefal os til andre
            </span>
          </button>

          <button className="flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
              <img
                src={commentImg}
                alt=""
                className="text-[13px] md:text-[20px]"
              />
            </div>
            <span className="text-[13px] md:text-[20px]  font-medium ">
              Kontakt os
            </span>
          </button>
        </div> */}

        <div className="text-center">
          <h2 className="text-[32px] md:text-4xl lg:text-[64px] font-[800] text-white mb-2">
            {partnerData?.businessName || "Business Name"}
          </h2>
          <p className="text-white font-[400] text-sm md:text-base lg:text-[18px] max-w-7xl mx-auto leading-normal px-4 md:px-0">
            {partnerData?.descriptionShort || "descriptionShort "}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PartnerProfileShortcut;