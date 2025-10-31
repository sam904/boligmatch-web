import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
import PartnerHeader from "./PartnerHeader";
import Statistik from "/src/assets/userImages/Statistik.svg";
import MinProfil from "/src/assets/userImages/MinProfil.svg";
import Partnere from "/src/assets/userImages/search-normal.svg";
import dashboard1 from "/src/assets/userImages/dashboard1.png";
import dashboard2 from "/src/assets/userImages/dashboard1.png";
import dashboard3 from "/src/assets/userImages/dashboard1.png";
import dashboardIcon1 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon2 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon3 from "/src/assets/userImages/userDashboardicon1.svg";

function SearchForPartner() {
  return (
    <>
      <div
        className="min-h-[70vh] md:min-h-screen relative bg-cover bg-no-repeat bg-[position:center_30%] sm:bg-[position:center_28%] md:bg-center"
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
                <span className="text-xs md:text-sm font-medium ">Statistik</span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={MinProfil} alt="" />
                </div>
                <span className="text-xs md:text-sm font-medium ">Min profil</span>
              </button>

              <button className="whitespace-nowrap flex items-center justify-center space-x-2 px-3 md:px-8 lg:px-12 py-1.5 md:py-3 lg:py-4 bg-[#91C73D] text-white rounded-lg transition-colors">
                <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                  <img src={Partnere} alt="" />
                </div>
                <span className="text-xs md:text-sm font-medium ">Partnere</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#06351e] py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1: Håndværkere */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              {/* Background Image */}
              <div className="relative h-48">
                <img
                  src={dashboard1}
                  alt="Craftsman working"
                  className="w-full h-full object-cover"
                />
                {/* White gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-6 text-center">
                {/* Green Icon */}
                <div className="relative -mt-8 mb-4">
                  <div className="w-16 h-16 bg-white  rounded-lg mx-auto flex items-center justify-center">
                    <img src={dashboardIcon1} alt="" className="w-8 h-8" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Håndværkere
                </h3>

                {/* Services List */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tømrer, murer, elektriker, VVS, maler, glarmester, handyman,
                  fugemand
                </p>
              </div>
            </div>

            {/* Card 2: Bygge- og anlæg */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              {/* Background Image */}
              <div className="relative h-48">
                <img
                  src={dashboard2}
                  alt="Construction work"
                  className="w-full h-full object-cover"
                />
                {/* White gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-6 text-center">
                {/* Green Icon */}
                <div className="relative -mt-8 mb-4">
                  <div className="w-16 h-16 bg-white rounded-lg mx-auto flex items-center justify-center">
                    <img src={dashboardIcon2} alt="" className="w-8 h-8" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Bygge- og anlæg
                </h3>

                {/* Services List */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Borectem nis restore nobit quate precerepudae nulluptam aut
                  quasit pelit lam
                </p>
              </div>
            </div>

            {/* Card 3: Flytning og opbevaring */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              {/* Background Image */}
              <div className="relative h-48">
                <img
                  src={dashboard3}
                  alt="Moving and storage"
                  className="w-full h-full object-cover"
                />
                {/* White gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-6 text-center">
                {/* Green Icon */}
                <div className="relative -mt-8 mb-4">
                  <div className="w-16 h-16 bg-white  rounded-lg mx-auto flex items-center justify-center">
                    <img src={dashboardIcon3} alt="" className="w-8 h-8" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Flytning og opbevaring
                </h3>

                {/* Services List */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Olore dolupta tquatet magnimus eos etus vel et molut quis
                  coratem hilicae vele
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchForPartner;
