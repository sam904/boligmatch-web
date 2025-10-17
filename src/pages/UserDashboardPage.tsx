import { useEffect, useState } from "react";
import userDashboard from "/src/assets/userImages/userDashboard.png";
import dashboard1 from "/src/assets/userImages/dashboard1.png";
import dashboard2 from "/src/assets/userImages/dashboard1.png";
import dashboard3 from "/src/assets/userImages/dashboard1.png";
import dashboardIcon1 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon2 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon3 from "/src/assets/userImages/userDashboardicon1.svg";
import UserHeader from "../features/users/UserPages/UserHeader";

export default function UserDashboardPage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const getUserData = () => {
      try {
        const userStr = localStorage.getItem('bm_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    };

    getUserData();
  }, []);

  return (
    <div className="relative h-[100vh]" style={{
      backgroundImage: `url(${userDashboard})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      {/* User Name and Role Overlay */}
      {userData && (
        <div className="absolute top-50 left-26 z-10">
          <div className="text-white leading-14">
            <h1 className="text-[64px] font-[800] mb-2 plus-jakarta-sans">
              Mit Boligmatch+
            </h1>
            <h2 className="text-[64px] font-[500] plus-jakarta-sans">
              {userData.firstName} {userData.lastName}
            </h2>
            {/* <p className="text-lg opacity-90 mt-1">
              {userData.roleName}
            </p> */}
          </div>
        </div>
      )}
      
      <UserHeader />
      <div className="bg-[#06351e] py-16">
        <div className="max-w-6xl mx-auto px-12">
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
                  Tømrer, murer, elektriker, VVS, maler, glarmester, handyman, fugemand
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
                  Borectem nis restore nobit quate precerepudae nulluptam aut quasit pelit lam
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
                  Olore dolupta tquatet magnimus eos etus vel et molut quis coratem hilicae vele
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#043428] h-[20vh] flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/src/assets/userImages/footerLogo.svg"
              alt="Boligmatch Logo"
            />
          </div>
        </div>
        <p className="text-white text-sm">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </div>
  );
}
