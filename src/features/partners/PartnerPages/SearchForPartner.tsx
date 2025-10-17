import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
import PartnerHeader from "./PartnerHeader";
import Statistik from "/src/assets/userImages/Statistik.svg";
// import MinProfil from "/src/assets/userImages/MinProfil.svg";
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
        className="h-[100vh]"
        style={{
          backgroundImage: `url(${parentStatisticsImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <PartnerHeader />

        <div className="flex flex-col">
          <div className="flex-1 flex items-center px-60 py-6">
            <div className="text-white">
              <h1 className="text-5xl md:text-5xl font-[800]  tracking-tight leading-tight mb-4">
                Partner Dashboard
              </h1>
              <h2 className="text-3xl md:text-4xl font-[500]  tracking-tight">
                Kabel-specialisten
              </h2>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-12 py-6">
            <div className="flex justify-center space-x-8">
              <button className="flex items-center space-x-3 px-12 py-4 bg-[#07583A] text-white rounded-lg transition-colors">
                <div className="h-[29px] w-[29px] flex items-center justify-center">
                  <img src={Statistik} alt="" />
                </div>
                <span className="text-[20px] font-medium ">
                  Statistik
                </span>
              </button>

              <button className="flex items-center space-x-3 px-12 py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
                <div className="h-[29px] w-[29px] flex items-center justify-center">
                  {/* <img src={MinProfil} alt="" /> */}
                </div>
                <span className="text-[20px] font-medium ">
                  Min profil
                </span>
              </button>

              <button className="flex items-center space-x-3 px-12 py-4 bg-[#91C73D] text-white rounded-lg transition-colors">
                <div className="h-[29px] w-[29px] flex items-center justify-center">
                  <img src={Partnere} alt=""  />
                </div>
                <span className="text-[20px] font-medium ">
                  Partnere
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#06351e] py-16">
        <div className="max-w-5xl mx-auto px-12">
          <div className="grid grid-cols-3 gap-8">
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
