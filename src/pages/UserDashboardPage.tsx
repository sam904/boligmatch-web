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
import { subCategoriesService } from "../services/subCategories.service";
import { useTranslation } from "react-i18next";
import commentImg from "/src/assets/userImages/comment.svg";
import searchImg from "/src/assets/userImages/search-normal.svg";
import favoriteImg from "/src/assets/userImages/favouriteIcon.svg";
import chatModelImg from "/src/assets/userImages/chatModelImg.svg";
import { favouritesService } from "../services/favourites.service";

export default function UserDashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "default" | "favorites" | "messages"
  >("default");
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const [fav, setFav] = useState();
  // console.log("fav", fav);

  useEffect(() => {
    // Get user data from localStorage
    const getUserData = () => {
      try {
        const userStr = localStorage.getItem("bm_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    };

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getAll(true);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Keep empty array if API fails
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    fetchCategories();
  }, []);

  useEffect(() => {
    const getUserDataAndFav = async () => {
      try {
        const userStr = localStorage.getItem("bm_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);

          setLoading(true);
          const favData = await favouritesService.getById(user.userId);
          console.log("Favourite data:", favData);
          // setFav(favData?.output)
        }
      } catch (error) {
        console.error("Error fetching user or favourite data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserDataAndFav();
  }, []);

  // Helper function to get images and icons for categories
  const getCategoryAssets = (index: number) => {
    const images = [dashboard1, dashboard2, dashboard3];
    const icons = [dashboardIcon1, dashboardIcon2, dashboardIcon3];
    return {
      image: images[index % images.length],
      icon: icons[index % icons.length],
    };
  };

  // Mock data for favorites (service providers)
  const favoriteProviders = [
    {
      id: 1,
      name: "Kabel - specialisten",
      profession: "Elektriker",
      category: "Håndværkere",
      logo: "/src/assets/userSupplier/Kabel-specialisten.png",
    },
    {
      id: 2,
      name: "Gudrun Maler",
      profession: "Maler",
      category: "Håndværkere",
      logo: "/src/assets/userSupplier/Gudrun Maler.png",
    },
    {
      id: 3,
      name: "Tommy Tømrer",
      profession: "Tømrer",
      category: "Håndværkere",
      logo: "/src/assets/userSupplier/Tommy Tømrer.png",
    },
    {
      id: 4,
      name: "Timmos VVS",
      profession: "VVS",
      category: "Håndværkere",
      logo: "/src/assets/userSupplier/Timmos VVS.png",
    },
    {
      id: 5,
      name: "Gudrun Maler",
      profession: "Murer",
      category: "Håndværkere",
      logo: "/src/assets/userSupplier/Gudrun Maler.png",
    },
  ];

  // Mock data for messages (conversations)
  const conversations = [
    {
      id: 1,
      partner: "Kabel-specialisten",
      topic: "Ny EL-tavle samt skift af LED-pærer i baderum",
      timestamp: "2 timer siden",
    },
    {
      id: 2,
      partner: "Timmos VVS",
      topic: "Skift af armatur i køkken",
      timestamp: "4 timer siden",
    },
    {
      id: 3,
      partner: "Murer Pete",
      topic: "Opmuring af sokkel på garage",
      timestamp: "1 dag siden",
    },
  ];

  // Handle category click - fetch subcategories and navigate to UserSupplier page
  const handleCategoryClick = async (categoryId: number) => {
    try {
      setLoading(true);
      console.log("Fetching subcategories for category ID:", categoryId);
      const subCategories = await subCategoriesService.getByCategoryId(
        categoryId
      );
      console.log("API response for subcategories:", subCategories);
      // Store subcategories in localStorage to pass to UserSupplier page
      localStorage.setItem("bm_subcategories", JSON.stringify(subCategories));
      console.log("Stored subcategories in localStorage:", subCategories);
      navigate("/userDashboard/user-supplier");
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      // Still navigate even if API fails
      navigate("/userDashboard/user-supplier");
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks
  const handleFavoritesClick = () => {
    setActiveView("favorites");
  };

  const handleMessagesClick = () => {
    setActiveView("messages");
  };

  const handlePartnersClick = () => {
    setActiveView("default");
  };

  return (
    <div
      className="relative h-[100vh]"
      style={{
        backgroundImage: `url(${userDashboard})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* User Name and Role Overlay */}
      {userData && (
        <div className="absolute top-50 left-26 z-10">
          <div className="text-white leading-14">
            <h1 className="text-[64px] font-[800] mb-2 ">Mit Boligmatch+</h1>
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
            onClick={handlePartnersClick}
            className="flex items-center gap-3 bg-[#0b3b35] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition"
            type="button"
          >
            <img src={searchImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">
              {t("userDashboard.buttons.partners")}
            </span>
          </button>

          {/* Saved as favorite - light green with heart icon */}
          <button
            onClick={handleFavoritesClick}
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition"
            type="button"
          >
            <img src={favoriteImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">
              {t("userDashboard.buttons.favorites")}
            </span>
          </button>

          {/* Samtaler - light green button */}
          <button
            onClick={handleMessagesClick}
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition font-medium"
            type="button"
          >
            <img src={commentImg} alt="" className="h-6 w-6" />
            <span className="font-semibold text-white text-[18px]">
              {t("userDashboard.buttons.messages")}
            </span>
          </button>
        </div>
      </div>
      <div className="bg-[#06351e] py-16">
        <div className="max-w-6xl mx-auto px-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Default View - Categories */}
              {activeView === "default" && (
                <div className="grid grid-cols-3 gap-8">
                  {categories.map((category, index) => {
                    const assets = getCategoryAssets(index);
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
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
                            {category.description ||
                              "Professional services and solutions"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Favorites View - Service Providers */}
              {activeView === "favorites" && (
                <div className="space-y-4">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Mine Favoritter
                  </h2>
                  <div className="space-y-3">
                    {favoriteProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        {/* Provider Logo */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img
                            src={provider.logo}
                            alt={provider.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        {/* Provider Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              {provider.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {provider.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {provider.profession}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages View - Conversations */}
              {activeView === "messages" && (
                <div className="space-y-4">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Mine Samtaler
                  </h2>
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Partner
                              </span>
                              <span className="text-sm text-gray-700">
                                {conversation.partner}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">
                                Emne
                              </span>
                              <span className="text-sm text-gray-700">
                                {conversation.topic}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Læs mere
                            </span>
                            <img
                              src={chatModelImg}
                              alt="Chat"
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
