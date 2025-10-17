import PartnerHeader from "./PartnerHeader";
import parentStatisticsImg from "/src/assets/userImages/parentStasts.png";
import Statistik from "/src/assets/userImages/Statistik.svg";
import MinProfil from "/src/assets/userImages/MinProfil.svg";
import Partnere from "/src/assets/userImages/Search.svg";
import PartnerStatDetails from "./PartnerStatDetails";

function ParentStatistics() {
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
          <div className="flex-1 flex items-center absolute top-42 left-30  px-12 py-6">
            <div className="text-white">
              <h1 className="text-5xl md:text-5xl font-[800] plus-jakarta-sans tracking-tight leading-tight mb-4">
                Partner Dashboard
              </h1>
              <h2 className="text-3xl md:text-4xl font-[500] plus-jakarta-sans tracking-tight">
                Kabel-specialisten
              </h2>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-12 py-6">
            <div className="flex justify-center space-x-8">
              <button className="flex items-center space-x-3 px-12 py-4 bg-[#07583A] text-white rounded-lg transition-colors">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={Statistik} alt="" />
                </div>
                <span className="text-sm font-medium plus-jakarta-sans">
                  Statistik
                </span>
              </button>

              <button className="flex items-center space-x-3 px-12 py-4 bg-[#91C73D] text-white rounded-lg hover:bg-[#7FB333] transition-colors">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={MinProfil} alt="" />
                </div>
                <span className="text-sm font-medium plus-jakarta-sans">
                  Min profil
                </span>
              </button>

              <button className="flex items-center space-x-3 px-12 py-4 bg-[#91C73D] text-white rounded-lg transition-colors">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={Partnere} alt="" />
                </div>
                <span className="text-sm font-medium plus-jakarta-sans">
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
