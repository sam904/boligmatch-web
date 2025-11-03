import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDashboard from "/src/assets/userImages/profileboligmatchImg.png";
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
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userData = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getAll(true);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getCategoryAssets = (index: number) => {
    const images = [dashboard1, dashboard2, dashboard3];
    const icons = [dashboardIcon1, dashboardIcon2, dashboardIcon3];
    return {
      image: images[index % images.length],
      icon: icons[index % icons.length],
    };
  };

  const handleCategoryClick = async (category: Category) => {
    try {
      setLoading(true);
      console.log("Fetching subcategories for category ID:", category.id);
      const subCategories = await subCategoriesService.getByCategoryId(
        category.id
      );
      console.log("API response for subcategories:", subCategories);
      localStorage.setItem("bm_subcategories", JSON.stringify(subCategories));
      console.log("Stored subcategories in localStorage:", subCategories);
      navigate("/user-supplier", {
        state: { categoryId: category.id, categoryName: category.name },
      });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      navigate("/user-supplier", {
        state: { categoryId: category.id, categoryName: category.name },
      });
    } finally {
      setLoading(false);
    }
  };

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

      const resFav: any = response;
      const favoritesData =
        (Array.isArray(resFav?.items) && resFav.items) ||
        (Array.isArray(resFav?.output?.result) && resFav.output.result) ||
        [];
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

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

      const resConv: any = response;
      const conversationsData =
        (Array.isArray(resConv?.items) && resConv.items) ||
        (Array.isArray((resConv as any)?.output?.result) &&
          (resConv as any).output.result) ||
        [];
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

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
    <div className="min-h-screen flex flex-col">
      
      <div
        className="relative h-[100vh]"
        style={{
          backgroundImage: `url(${userDashboard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#01351f]/60 via-transparent to-transparent pointer-events-none" />

        <UserHeader />

        {/* Welcome Text */}
        {userData && (
          <div className="absolute top-60 z-10 px-4 sm:px-6 md:px-8 lg:px-12 mt-auto mb-32 sm:mb-36 md:mb-40 lg:mb-44">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-1 sm:mb-2 leading-tight">
                Mit Boligmatch+
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-tight">
                {userData.firstName} {userData.lastName}
              </h2>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8 md:pb-10">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
              <button
                onClick={handlePartnersClick}
                className={`${activeView === "default" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"} w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-5 sm:px-6 md:px-7 py-3 sm:py-3.5 shadow-md hover:opacity-90 transition cursor-pointer`}
                type="button"
              >
                <img src={searchImg} alt="" className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="font-semibold text-base sm:text-lg whitespace-nowrap">
                  {t("userDashboard.buttons.partners")}
                </span>
              </button>


              <button
                onClick={handleFavoritesClick}
                className={`${activeView === "favorites" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"} w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-5 sm:px-6 md:px-7 py-3 sm:py-3.5 shadow-md hover:opacity-90 transition cursor-pointer`}
                type="button"
              >
                <img
                  src={favoriteImg}
                  alt=""
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <span className="font-semibold text-base sm:text-lg whitespace-nowrap">
                  {t("userDashboard.buttons.favorites")}
                </span>
              </button>


              <button
                onClick={handleMessagesClick}
                className={`${activeView === "messages" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"} w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-5 sm:px-6 md:px-7 py-3 sm:py-3.5 shadow-md hover:opacity-90 transition font-medium cursor-pointer`}
                type="button"
              >
                <img
                  src={commentImg}
                  alt=""
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <span className="font-semibold text-base sm:text-lg whitespace-nowrap">
                  {t("userDashboard.buttons.messages")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-[#01351f] py-8 sm:py-12 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && activeView === "default" ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Categories Grid */}
              {activeView === "default" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {categories.map((category, index) => {
                    const assets = getCategoryAssets(index);
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="w-full max-w-md mx-auto rounded-lg sm:rounded-xl bg-white transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl"
                      >
                        <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-t-lg sm:rounded-t-xl overflow-hidden">
                          <img
                            src={category.imageUrl || assets.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = assets.image;
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                        </div>

                        <div className="p-4 sm:p-5 md:p-6 text-center flex flex-col items-center gap-2">
                          <div className="w-16 h-12 sm:w-20 sm:h-14 flex items-center justify-center -mt-4 sm:-mt-6 mb-0">
                            <img
                              src={category.iconUrl || assets.icon}
                              alt={category.name}
                              className="w-[60px] h-[55px] sm:w-14 sm:h-14 object-contain"
                              onError={(e) => {
                                e.currentTarget.src = assets.icon;
                              }}
                            />
                          </div>

                          <h3 className="text-xl sm:text-2xl font-extrabold text-[#052011] mb-1">
                            {category.name}
                          </h3>

                          <p className="text-sm sm:text-base text-[#052011] leading-relaxed px-2">
                            {category.description ||
                              "Professional services and solutions"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Favorites View */}
              {activeView === "favorites" && (
                <div className="space-y-4">
                  <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    Mine Favoritter
                  </h2>
                  {favoritesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg">
                        Loading favorites...
                      </div>
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="space-y-3">
                      {favorites.map((favorite) => (
                        <div
                          key={favorite.id}
                          className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="text-xs font-semibold text-gray-600">
                              #{favorite.partnerId}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-gray-500">
                                Partner ID: {favorite.partnerId}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              Favorite #{favorite.id}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                favorite.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {favorite.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white text-base sm:text-lg text-center py-8">
                      No favorites found
                    </div>
                  )}
                </div>
              )}

              {/* Messages View */}
              {activeView === "messages" && (
                <div className="space-y-4">
                  <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    Mine Samtaler
                  </h2>
                  {conversationsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg">
                        Loading conversations...
                      </div>
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-3">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Subject
                                </span>
                                <span className="text-sm sm:text-base font-semibold text-gray-800 break-words">
                                  {conversation.messageSubject || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex-shrink-0">
                                  Content
                                </span>
                                <span className="text-sm text-gray-600 line-clamp-2">
                                  {conversation.messageContent || "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700 self-end sm:self-auto flex-shrink-0">
                              <span className="text-sm">Read more</span>
                              <img
                                src={chatModelImg}
                                alt="Chat"
                                className="w-5 h-5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white text-base sm:text-lg text-center py-8">
                      No conversations found
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#043428] text-white text-center p-4 sm:p-6">
        <div className="flex flex-col items-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-40 sm:w-48 md:w-52 h-10 sm:h-11 mx-auto">
              <img
                src="/src/assets/userImages/footerLogo.svg"
                alt="Boligmatch Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <p className="text-white text-xs sm:text-sm md:text-base figtree font-normal text-center px-4">
            Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
          </p>
        </div>
      </footer>
    </div>
  );
}
