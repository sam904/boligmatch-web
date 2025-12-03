import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDashboard from "/src/assets/userImages/profileboligmatchIm2.jpeg";
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
import categoryGradientImg from "/src/assets/userImages/categoryGradient.svg";
import { partnerService } from "../services/partner.service";
import Footer from "./Footer";
import closeImg from "/src/assets/userImages/close.svg"

interface FavouriteItem {
  id?: number;
  userId?: number;
  partnerId?: number;
  isActive?: boolean;
  partnerName?: string;
  businessName?: string;
  descriptionShort?: string;
  logoUrl?: string;
  thumbnail?: string;
  [key: string]: any;
}

interface ConversationItem {
  id?: number;
  messageSubject?: string;
  messageContent?: string;
  senderId?: number;
  receiverId?: number;
  type?: string;
  partnerName?: string;
  userName?: string;
  partnerEmail?: string;
  logoUrl?: string;
  thumbnail?: string;
  createdDate?: string;
  createdBy?: number;
  isActive?: boolean;
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
  const [openConversation, setOpenConversation] =
    useState<ConversationItem | null>(null);
  console.log("isMobile", isMobile);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const formatConvDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    try {
      return d.toLocaleDateString("da-DK", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    } catch {
      return d.toISOString().split("T")[0];
    }
  };

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
    const userData = localStorage.getItem("bm_user");
    if (!userData) {
      navigate("/");
    }
  }, [navigate]);

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

  // Helpers to safely read Category/Subcategory names from favourite payloads
  const getFavouriteCategory = (fav: FavouriteItem) => {
    return (
      fav.categoryName ||
      fav.category ||
      fav.categorys ||
      fav?.parSubCatlst?.[0]?.categorys ||
      "-"
    );
  };

  const getFavouriteSubCategory = (fav: FavouriteItem) => {
    return (
      fav.subCategoryName ||
      fav.subCategory ||
      fav.subCategories ||
      fav?.parSubCatlst?.[0]?.subCategories ||
      "-"
    );
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
      navigate("/user/user-supplier", {
        state: { categoryId: category.id, categoryName: category.name },
      });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      navigate("/user/user-supplier", {
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

  const handleFavoriteMoreInfo = async (favorite: FavouriteItem) => {
    try {
      if (!favorite?.partnerId) {
        toast.error("Invalid partner");
        return;
      }
      const detail = await partnerService.getById(favorite.partnerId);
      localStorage.setItem("bm_currentPartner", JSON.stringify(detail));
      navigate("/user/supplier-profile");
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Failed to load partner details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className={`
              relative 
              h-[368px]      
              md:h-[100vh]     
              bg-no-repeat bg-cover bg-center
              bg-[url('/src/assets/userImages/profileResponsiveBanner.png')] 
              md:bg-none       
  `}
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
          <div className="absolute top-40 sm:top-48 md:top-52 lg:top-60 z-10 px-4 sm:px-6 md:px-8 lg:px-24 mt-auto mb-32 sm:mb-36 md:mb-40 lg:mb-44">
            <div className="text-white">
              <div className="max-w-[722px]">
                <h1 className="text-[28px] md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-0 md:mb-0.5 leading-tight">
                  Mit Boligmatch+
                </h1>
              </div>
              <div className="max-w-[561px] mx-auto">
                <h2 className="text-[28px] md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-tight text-center break-words">
                  {userData.firstName} {userData.lastName}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8 md:pb-10">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex flex-row sm:flex-row items-center justify-between sm:justify-center gap-2 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
              <button
                onClick={handlePartnersClick}
                className={`${activeView === "default"
                  ? "bg-[#145939] text-white"
                  : "bg-[#95c11f] text-white"
                  } flex items-center justify-center gap-1 md:gap-3 rounded-[18px] md:rounded-2xl px-5 sm:px-6 md:px-7 shadow-lg sm:shadow-md ring-1 ring-white/20 hover:opacity-90 transition cursor-pointer w-[240px] h-[55px]`}
                type="button"
              >
                <img
                  src={searchImg}
                  alt=""
                  className="md:h-6 md:w-6 h-[18px] w-[18px]"
                />
                <span className="font-semibold md:text-lg text-[12px] whitespace-nowrap figtree">
                  {t("userDashboard.buttons.partners")}
                </span>
              </button>

              <button
                onClick={handleFavoritesClick}
                className={`${activeView === "favorites"
                  ? "bg-[#145939] text-white"
                  : "bg-[#95c11f] text-white"
                  } flex items-center justify-center gap-1 md:gap-3 rounded-[18px] md:rounded-2xl px-5 sm:px-6 md:px-7 shadow-lg sm:shadow-md ring-1 ring-white/20 hover:opacity-90 transition cursor-pointer w-[272.38px] h-[55px]`}
                type="button"
              >
                <img
                  src={favoriteImg}
                  alt=""
                  className="md:h-6 md:w-6 h-[18px] w-[18px]"
                />
                <span className="font-semibold md:text-lg text-[12px] whitespace-nowrap figtree hidden sm:inline">
                  {t("userDashboard.buttons.favorites")}
                </span>
                <span className="font-semibold md:text-lg text-[12px] whitespace-nowrap figtree sm:hidden">
                  {t("userDashboard.buttons.favoritesMobile")}
                </span>
              </button>

              <button
                onClick={handleMessagesClick}
                className={`${activeView === "messages"
                  ? "bg-[#145939] text-white"
                  : "bg-[#95c11f] text-white"
                  } flex items-center justify-center gap-1 md:gap-3 rounded-[18px] md:rounded-2xl px-5 sm:px-6 md:px-7 shadow-lg sm:shadow-md ring-1 ring-white/20 hover:opacity-90 transition font-medium cursor-pointer w-[272.38px] h-[55px]`}
                type="button"
              >
                <img
                  src={commentImg}
                  alt=""
                  className="md:h-6 md:w-6 h-[18px] w-[18px]"
                />
                <span className="font-semibold md:text-lg text-[12px] whitespace-nowrap">
                  {t("userDashboard.buttons.messages")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#01351f] py-4 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          {loading && activeView === "default" ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">{t("userDashboard.loading")}</div>
            </div>
          ) : (
            <>
              {/* Categories Grid */}
              {activeView === "default" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-4">
                  {categories.map((category, index) => {
                    const assets = getCategoryAssets(index);
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="w-full h-[394px] sm:w-auto sm:h-auto mx-auto rounded-[18px] sm:rounded-xl bg-white transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl"
                      >
                        <div className="relative w-full h-[222px] sm:h-56 md:h-64 lg:h-72 rounded-t-[18px] sm:rounded-t-xl overflow-hidden">
                          <img
                            src={category.imageUrl || assets.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = assets.image;
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-[120px] sm:h-[50px] bg-gradient-to-t from-white to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0">
                            <img src={categoryGradientImg} alt="" />
                          </div>
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

                          <h3 className="text-xl sm:text-2xl font-extrabold text-[#052011] -mb-1">
                            {category.name}
                          </h3>

                          <p className="text-sm text-[#052011] leading-relaxed px-2">
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
                    {t("userDashboard.favoritesTitle")}
                  </h2>
                  {favoritesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg">
                        {t("userDashboard.loadingFavorites")}
                      </div>
                    </div>
                  ) : favorites.length > 0 ? (
                    <>
                      {/* Mobile List View */}
                      <div className="md:hidden space-y-3">
                        {favorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="bg-white rounded-lg p-3 flex items-center gap-3 border border-gray-100 cursor-pointer"
                            onClick={() => handleFavoriteMoreInfo(favorite)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleFavoriteMoreInfo(favorite);
                              }
                            }}
                          >
                            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-white rounded">
                              {favorite.logoUrl && (
                                <img
                                  className="w-12 h-12 object-contain"
                                  src={favorite.logoUrl}
                                  alt=""
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-extrabold text-[#000000] truncate">
                                  {favorite.partnerName ||
                                    favorite.businessName ||
                                    "N/A"}
                                </span>
                                <span className="text-[11px] text-[#6b7280] truncate">
                                  {getFavouriteCategory(favorite)}
                                </span>
                                <span className="text-[12px] font-semibold text-[#000000] truncate">
                                  {getFavouriteSubCategory(favorite)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Card View */}
                      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="bg-white rounded-xl overflow-hidden flex flex-col h-[330px]"
                          >
                            {/* <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                              <img
                                src={
                                  favorite.thumbnail ||
                                  favorite.logoUrl ||
                                  dashboard1
                                }
                                alt={
                                  favorite.partnerName || favorite.businessName
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = dashboard1;
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                            </div> */}

                            <div className="p-5 text-center flex flex-col items-center gap-4 flex-1">
                              <div className="w-[83px] h-[77px] flex items-center justify-center mt-4 mb-1 bg-white rounded-lg">
                                {favorite.logoUrl && (
                                  <img
                                    src={favorite.logoUrl}
                                    alt="Business logo"
                                    className="w-[83px] h-[77px] object-contain"
                                  />
                                )}
                              </div>

                              <h3 className="text-xl font-extrabold text-[#052011] mb-1">
                                {favorite.partnerName ||
                                  favorite.businessName ||
                                  "Partner Name"}
                              </h3>

                              <p className="text-sm text-[#052011] leading-relaxed px-2 line-clamp-3">
                                {favorite.descriptionShort ||
                                  "Professional services and solutions"}
                              </p>

                              <button
                                onClick={() => handleFavoriteMoreInfo(favorite)}
                                className="mt-auto text-sm font-semibold text-[#01351f] hover:text-[#145939] transition cursor-pointer"
                              >
                                {t("userDashboard.moreInfo")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-white text-base sm:text-lg text-center py-8">
                      {t("userDashboard.noFavorites")}
                    </div>
                  )}
                </div>
              )}

              {/* Messages View */}
              {activeView === "messages" && (
                <div className="space-y-4">
                  <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    {t("userDashboard.conversationsTitle")}
                  </h2>
                  {conversationsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg">
                        {t("userDashboard.loadingConversations")}
                      </div>
                    </div>
                  ) : conversations.length > 0 ? (
                    <>
                      {/* Mobile List View */}
                      <div className="md:hidden space-y-3">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="bg-white rounded-xl p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="text-sm font-extrabold text-[#052011]">
                                  {t("userDashboard.partnerLabel")}
                                </div>
                                <div className="text-sm text-[#052011]">
                                  {conversation.partnerName || "-"}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2 text-[#01351f] cursor-pointer"
                                onClick={() =>
                                  setOpenConversation(conversation)
                                }
                              >
                                <span className="text-sm font-semibold">
                                  {t("userDashboard.readMore")}
                                </span>
                                <img
                                  src={chatModelImg}
                                  alt="Chat"
                                  className="w-5 h-5"
                                />
                              </div>
                            </div>
                            <div className="mt-1">
                              <div className="text-sm font-extrabold text-[#052011] mb-1">
                                {t("userDashboard.subjectLabel")}
                              </div>
                              <div className="text-sm text-[#052011] line-clamp-2">
                                {conversation.messageSubject || "-"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Card View */}
                      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="bg-white rounded-2xl p-5 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="text-base font-extrabold text-[#052011]">
                                  {t("userDashboard.partnerLabel")}
                                </div>
                                <div className="text-sm text-[#052011]">
                                  {conversation.partnerName || "-"}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2 text-[#01351f] cursor-pointer"
                                onClick={() =>
                                  setOpenConversation(conversation)
                                }
                              >
                                <span className="text-sm font-semibold">
                                 {t("userDashboard.readMore")}
                                </span>
                                <img
                                  src={chatModelImg}
                                  alt="Chat"
                                  className="w-5 h-5"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-base font-extrabold text-[#052011] mb-1">
                                {t("userDashboard.subjectLabel")}
                              </div>
                              <div className="text-sm text-[#052011] line-clamp-2">
                                {conversation.messageSubject || "-"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-white text-base sm:text-lg text-center py-8">
                      {t("userDashboard.noConversations")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {openConversation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 cursor-pointer" 
            onClick={() => setOpenConversation(null)}
          />
          <div 
            className="relative z-[1001] w-[90%] max-w-md bg-[#E5E7EB] rounded-[18px] shadow-xl p-6 border border-[#1F7A58]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-3 text-black text-xl cursor-pointer hover:text-gray-700"
              aria-label="Close"
              onClick={() => setOpenConversation(null)}
            >
              <img src={closeImg} alt="" />
            </button>

            <div className="flex flex-col items-center gap-2 mb-4">
              <img
                src={chatModelImg}
                alt="chat"
                className="w-[64px] h-[64px]"
              />
              <h3 className="text-center font-extrabold text-lg">{t("userDashboard.messageTitle")}</h3>
            </div>

            <div className="space-y-4 text-[#052011]">
              <div>
                <div className="text-sm font-extrabold">Dato</div>
                <div className="text-sm">
                  {formatConvDate(openConversation.createdDate)}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">Partner</div>
                <div className="text-sm">
                  {openConversation.partnerName || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">Emne</div>
                <div className="text-sm">
                  {openConversation.messageSubject || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">Beskrivelse</div>
                <div className="text-sm leading-relaxed">
                  {openConversation.messageContent || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {/* <footer className="bg-[#01351f] text-white text-center p-4 sm:p-6">
        <div className="flex flex-col items-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-40 sm:w-48 md:w-52 h-10 sm:h-11 mx-auto">
              <img
                src={footerLogo}
                alt="Boligmatch Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <p className="text-white text-xs sm:text-sm md:text-base figtree font-normal text-center px-4">
            Tørringvej 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR
            33160437
          </p>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
}
