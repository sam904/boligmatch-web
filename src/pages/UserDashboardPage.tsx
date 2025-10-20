import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDashboard from "/src/assets/userImages/userDashboard.png";
import dashboard1 from "/src/assets/userImages/dashboard1.png";
import dashboard2 from "/src/assets/userImages/dashboard1.png";
import dashboard3 from "/src/assets/userImages/dashboard1.png";
import dashboardIcon1 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon2 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon3 from "/src/assets/userImages/userDashboardicon1.svg";
import UserHeader from "../features/users/UserPages/UserHeader";
import { categoryService, type Category } from "../services/category.service";
import { useTranslation } from "react-i18next";
import commentImg from "/src/assets/userImages/comment.svg"
import searchImg from "/src/assets/userImages/search-normal.svg";
import favoriteImg from "/src/assets/userImages/favouriteIcon.svg";

export default function UserDashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

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

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getAll(true);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep empty array if API fails
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    fetchCategories();
  }, []);

  // Helper function to get images and icons for categories
  const getCategoryAssets = (index: number) => {
    const images = [dashboard1, dashboard2, dashboard3];
    const icons = [dashboardIcon1, dashboardIcon2, dashboardIcon3];
    return {
      image: images[index % images.length],
      icon: icons[index % icons.length]
    };
  };

  // Handle category click - navigate to UserSupplier page
  const handleCategoryClick = () => {
    navigate('/userDashboard/user-supplier');
  };

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
            <h1 className="text-[64px] font-[800] mb-2 ">
              Mit Boligmatch+
            </h1>
            <h2 className="text-[64px] font-[500] ">
              {userData.firstName} {userData.lastName}
            </h2>
            {/* <p className="text-lg opacity-90 mt-1">
              {userData.roleName}
            </p> */}
          </div>
        </div>
      )}

      <UserHeader />
      {/* Floating action buttons over hero background */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10">
        <div className="flex items-center gap-6">
          {/* Partnere - dark button with search icon */}
          <button
            className="flex items-center gap-3 bg-[#0b3b35] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition"
            type="button"
          >
            <img src={searchImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">{t('userDashboard.buttons.partners')}</span>
          </button>

          {/* Saved as favorite - light green with heart icon */}
          <button
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition"
            type="button"
          >
            <img src={favoriteImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">{t('userDashboard.buttons.favorites')}</span>
          </button>

          {/* Samtaler - light green button */}
          <button
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition font-medium"
            type="button"
          >
            <img src={commentImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">{t('userDashboard.buttons.messages')}</span>
          </button>
        </div>
      </div>
      <div className="bg-[#06351e] py-16">
        <div className="max-w-6xl mx-auto px-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading categories...</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const assets = getCategoryAssets(index);
                return (
                  <div
                    key={category.id}
                    onClick={handleCategoryClick}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    {/* Background Image */}
                    <div className="relative h-48">
                      <img
                        src={category.imageUrl || assets.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default image if category image fails to load
                          e.currentTarget.src = assets.image;
                        }}
                      />
                      {/* White gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 text-center">
                      {/* Category Icon */}
                      <div className="relative -mt-8 mb-4">
                        <div className="w-16 h-16 bg-white rounded-lg mx-auto flex items-center justify-center">
                          <img
                            src={category.iconUrl || assets.icon}
                            alt={category.name}
                            className="w-8 h-8"
                            onError={(e) => {
                              // Fallback to default icon if category icon fails to load
                              e.currentTarget.src = assets.icon;
                            }}
                          />
                        </div>
                      </div>

                      {/* Category Title */}
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {category.name}
                      </h3>

                      {/* Category Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description || "Professional services and solutions"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
