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
import { useAppSelector } from "../app/hooks";
import commentImg from "/src/assets/userImages/comment.svg";
import searchImg from "/src/assets/userImages/search-normal.svg";
import favoriteImg from "/src/assets/userImages/favouriteIcon.svg";
import chatModelImg from "/src/assets/userImages/chatModelImg.svg";
import { favouritesService } from "../services/favourites.service";
import { conversationService } from "../services/conversation.service";
import { toast } from "sonner";

interface FavouriteItem {
  id?: number;
  userId?: number;
  partnerId?: number;
  isActive?: boolean;
  [key: string]: any;
}

interface ConversationItem {
  id?: number;
  messageSubject?: string;
  messageContent?: string;
  senderId?: number;
  receiverId?: number;
  type?: string;
  partner?: string;
  topic?: string;
  timestamp?: string;
  [key: string]: any;
}

export default function UserDashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "default" | "favorites" | "messages"
  >("default");
  const [favorites, setFavorites] = useState<FavouriteItem[]>([]);
  console.log("favorites", favorites);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get user data from Redux store instead of localStorage
  const userData = useAppSelector((state) => state.auth.user);

  useEffect(() => {
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

    fetchCategories();
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

  // Handle category click - fetch subcategories and navigate to UserSupplier page
  const handleCategoryClick = async (categoryId: number) => {
    try {
      setLoading(true);
      console.log("Fetching subcategories for category ID:", categoryId);
      const subCategories = await subCategoriesService.getByCategoryId(
        categoryId
      );
      console.log("API response for subcategories:", subCategories);
      localStorage.setItem("bm_subcategories", JSON.stringify(subCategories));
      console.log("Stored subcategories in localStorage:", subCategories);
      // navigate("/userProfile/user-supplier");
      navigate("/user-supplier");
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      navigate("/user-supplier");
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      setFavoritesLoading(true);
      if (!userData?.userId) {
        toast.error("User not found");
        return;
      }

      const payload = {
        page: 1,
        pageSize: 10,
        searchTerm: "",
        sortDirection: "asc",
        sortField: "id",
        userId: userData.userId,
      };

      console.log("Fetching favorites with payload:", payload);
      const response = await favouritesService.getPaginated(payload);
      // console.log("Favorites API response:", response?.output);

      // Extract favorites from response
      const favoritesData = response?.items || [];
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      if (!userData?.userId) {
        toast.error("User not found");
        return;
      }

      const payload = {
        page: 1,
        pageSize: 10,
        searchTerm: "",
        sortDirection: "asc",
        sortField: "id",
        userId: userData.userId,
      };

      console.log("Fetching conversations with payload:", payload);
      const response = await conversationService.getPaginated(payload);
      console.log("Conversations API response:", response);

      // Extract conversations from response
      const conversationsData = response?.items || [];
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Handle button clicks
  const handleFavoritesClick = () => {
    setActiveView("favorites");
    fetchFavorites();
  };

  const handleMessagesClick = () => {
    setActiveView("messages");
    fetchConversations();
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
            className="flex items-center gap-3 bg-[#0b3b35] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition cursor-pointer"
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
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition cursor-pointer"
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
            className="flex items-center gap-3 bg-[#91C73D] text-white rounded-2xl px-7 py-4 shadow-md hover:opacity-90 transition font-medium cursor-pointer"
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
        <div className="max-w-7xl mx-auto px-6">
          {loading && activeView === "default" ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Default View - Categories */}
              {activeView === "default" && (
                <div className="grid grid-cols-3 gap-4 px-8">
                  {categories.map((category, index) => {
                    const assets = getCategoryAssets(index);
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-[374px] h-[540px] rounded-[10px] transition-all duration-300 cursor-pointer overflow-hidden opacity-100 mx-auto"
                      >
                        <div className="relative">
                          <img
                            src={category.imageUrl || assets.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = assets.image;
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 text-center flex flex-col items-center gap-[8px]">
                          {/* Icon */}
                          <div className="w-[79px] h-[48px] flex items-center justify-center -mt-6 mb-0">
                            <img
                              src={category.iconUrl || assets.icon}
                              alt={category.name}
                              className="w-8 h-8 object-contain text-[#165933]"
                              style={{
                                filter:
                                  "invert(31%) sepia(89%) saturate(339%) hue-rotate(93deg) brightness(94%) contrast(90%)",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = assets.icon;
                              }}
                            />
                          </div>

                          {/* Title */}
                          <h3 className="text-[24px] font-[800] text-[#052011] mb-1">
                            {category.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-[#052011] leading-relaxed px- text-[16px] font-[400]">
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
                  {favoritesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-lg">
                        Loading favorites...
                      </div>
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="space-y-3">
                      {favorites.map((favorite) => (
                        <div
                          key={favorite.id}
                          className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                          {/* Provider Logo */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-sm font-semibold text-gray-600">
                              #{favorite.partnerId}
                            </div>
                          </div>

                          {/* Provider Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">
                                Partner ID: {favorite.partnerId}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Favorite #{favorite.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {favorite.isActive ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white text-lg text-center py-8">
                      No favorites found
                    </div>
                  )}
                </div>
              )}

              {/* Messages View - Conversations */}
              {activeView === "messages" && (
                <div className="space-y-4">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Mine Samtaler
                  </h2>
                  {conversationsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-lg">
                        Loading conversations...
                      </div>
                    </div>
                  ) : conversations.length > 0 ? (
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
                                  Subject
                                </span>
                                <span className="text-sm text-gray-700">
                                  {conversation.messageSubject || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">
                                  Content
                                </span>
                                <span className="text-sm text-gray-700 truncate">
                                  {conversation.messageContent || "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Read more
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
                  ) : (
                    <div className="text-white text-lg text-center py-8">
                      No conversations found
                    </div>
                  )}
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
