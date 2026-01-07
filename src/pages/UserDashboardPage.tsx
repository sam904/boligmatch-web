import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userDashboard from "/src/assets/userImages/profileboligmatchIm2.jpeg";
import dashboard1 from "/src/assets/userImages/dashboard1.svg";
import dashboard2 from "/src/assets/userImages/dashboard1.svg";
import dashboard3 from "/src/assets/userImages/dashboard1.svg";
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
import closeImg from "/src/assets/userImages/close.svg";

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
      fav.categoriesName ||
      fav.categoryName ||
      fav.category ||
      fav.categorys ||
      fav?.parSubCatlst?.[0]?.categorys ||
      "-"
    );
  };

  const getFavouriteSubCategory = (fav: FavouriteItem) => {
    return (
      fav.subCategoriesName ||
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
              md:h-[80vh]     
              bg-no-repeat bg-cover bg-center
              bg-[url('/src/assets/userImages/profileResponsiveBanner.svg')] 
              md:bg-none       
  `}
        style={{
          backgroundImage: `url(${userDashboard})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#01351f]  pointer-events-none" />

        <UserHeader />

        {userData && (
          <div className="absolute left-0 right-0 top-[140px] sm:top-[160px] md:top-[180px] lg:top-[140px] xl:top-[140px] bottom-[100px] sm:bottom-[110px] md:bottom-[130px] lg:bottom-[150px] z-10 px-4 sm:px-6 md:px-8 lg:px-24 flex flex-col justify-center">
            <div className="text-white">
              <div className="max-w-[722px]">
                <h1 className="text-[28px] md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-0 md:mb-0.5 leading-tight">
                  Mit Boligmatch+
                </h1>
              </div>
              <div className="max-w-[561px]">
                <h2 className="text-[28px] md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-15 break-words">
                  {userData.firstName} {userData.lastName}
                </h2>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8 md:pb-10">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex flex-row items-center justify-between sm:justify-center gap-3 md:gap-6 max-w-4xl mx-auto px-2">
              <button
                onClick={handlePartnersClick}
                type="button"
                className={`
      flex items-center justify-center
      gap-1 md:gap-3
      w-[272px] h-[42px] md:h-[55px]
      px-5 sm:px-6 md:px-7
      rounded-xl
      shadow-lg sm:shadow-md
      hover:opacity-90
      transition
      cursor-pointer
      figtree
      font-semibold md:text-[20px] text-[12px]
      ${activeView === "default" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
    `}
              >
                <img
                  src={searchImg}
                  alt=""
                  className="h-[18px] w-[18px] md:h-6 md:w-6"
                />
                <span className="whitespace-nowrap">
                  {t("userDashboard.buttons.partners")}
                </span>
              </button>

              <button
                onClick={handleFavoritesClick}
                type="button"
                className={`
      flex items-center justify-center
      gap-1 md:gap-3
      w-[272px] h-[42px] md:h-[55px]
      px-5 sm:px-6 md:px-7
      rounded-xl
      shadow-lg sm:shadow-md
      hover:opacity-90
      transition
      cursor-pointer
      figtree
      font-semibold md:text-[20px] text-[12px]
      ${activeView === "favorites" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
    `}
              >
                <img
                  src={favoriteImg}
                  alt=""
                  className="h-[18px] w-[18px] md:h-6 md:w-6"
                />
                <span className="whitespace-nowrap hidden sm:inline">
                  {t("userDashboard.buttons.favorites")}
                </span>
                <span className="whitespace-nowrap sm:hidden">
                  {t("userDashboard.buttons.favoritesMobile")}
                </span>
              </button>

              <button
                onClick={handleMessagesClick}
                type="button"
                className={`
                            flex items-center justify-center
                            gap-1 md:gap-3
                            w-[272px] h-[42px] md:h-[55px]
                            px-5 sm:px-6 md:px-7
                            rounded-xl
                            shadow-lg sm:shadow-md
                            hover:opacity-90
                            transition
                            cursor-pointer
                            figtree
                            font-semibold md:text-[20px] text-[12px]
                            ${activeView === "messages" ? "bg-[#145939] text-white" : "bg-[#95c11f] text-white"}
                          `}
              >
                <img
                  src={commentImg}
                  alt=""
                  className="h-[18px] w-[18px] md:h-6 md:w-6"
                />
                <span className="whitespace-nowrap">
                  {t("userDashboard.buttons.messages")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#01351f] py-4 md:py-10 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          {loading && activeView === "default" ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">{t("userDashboard.loading")}</div>
            </div>
          ) : (
            <>
              {activeView === "default" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-4">
                  {categories.map((category, index) => {
                    const assets = getCategoryAssets(index);
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="
                        w-[360px] 
                        h-[420px]
                        md:w-[374px]
                        md:h-[540px]
                        mx-auto
                        rounded-[12px]
                        transition-all
                        duration-300
                        cursor-pointer
                        overflow-hidden
                        hover:shadow-xl
                        flex
                        bg-white
                        flex-col
                        "
                      >
                        <div className="relative w-full h-[340px] md:h-[340px] lg:h-[340px] xl:h-[340px] overflow-hidden">
                          <img
                            src={category.imageUrl || assets.image}
                            alt={category.name}
                            className="w-full h-full object-cover "
                            onError={(e) => {
                              e.currentTarget.src = assets.image;
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-[80px] sm:h-[50px] bg-gradient-to-t from-white to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0">
                            <img src={categoryGradientImg} alt="" className="w-full h-auto" />
                          </div>
                        </div>

                        <div className="p-4 sm:p-5 md:p-6 text-center flex flex-col items-center  gap-2">
                          <div className="w-16 h-12 sm:w-20 sm:h-14 flex items-center justify-center -mt-2 sm:-mt-6 mb-0">
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

                          <p className="text-sm sm:text-base text-[#052011] leading-[20px] px-2">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeView === "favorites" && (
                <>
                  <div className="md:hidden space-y-3">
                    {favoritesLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="text-white text-base sm:text-lg">
                          {t("userDashboard.loadingFavorites")}
                        </div>
                      </div>
                    ) : favorites.length > 0 ? (
                      favorites.map((favorite) => (
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
                      ))
                    ) : (
                      <div className="flex justify-center items-center h-64">
                        <div className="text-white text-base sm:text-lg text-center">
                          {t("userDashboard.noFavorites")}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeView === "messages" && (
                <div className="space-y-4">
                  {conversationsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg">
                        {t("userDashboard.loadingConversations")}
                      </div>
                    </div>
                  ) : conversations.length > 0 ? (
                    <>
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
                              <button
                                type="button"
                                className="flex items-center gap-2 text-[#01351f] cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0"
                                onClick={() =>
                                  setOpenConversation(conversation)
                                }
                              >
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  {t("userDashboard.readMore")}
                                </span>
                                <img
                                  src={chatModelImg}
                                  alt="Chat"
                                  className="w-5 h-5"
                                />
                              </button>
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
                              <button
                                type="button"
                                className="flex items-center gap-2 text-[#01351f] cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0 relative z-10 flex-shrink-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenConversation(conversation);
                                }}
                              >
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  {t("userDashboard.readMore")}
                                </span>
                                <img
                                  src={chatModelImg}
                                  alt="Chat"
                                  className="w-5 h-5 flex-shrink-0"
                                />
                              </button>
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
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-base sm:text-lg text-center">
                        {t("userDashboard.noConversations")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {activeView === "favorites" && (
          <section className="hidden md:block bg-[#01351f] w-full flex justify-center pt-0 pb-8 md:pt-2 md:pb-30 px-30 relative overflow-visible z-20">
            {favoritesLoading ? (
              <div className="col-span-3 flex justify-center items-center h-64">
                <div className="text-white text-lg">
                  {t("userDashboard.loadingFavorites")}
                </div>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 max-w-7xl px-4 md:px-7 w-full overflow-visible">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="flex justify-center overflow-visible"
                  >
                    <div
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full h-[320px] md:w-[413px] md:h-[453px] flex flex-col items-center px-6 py-4 md:px-8 md:py-10 text-center justify-between"
                    >
                      <div className="flex flex-col items-center w-full flex-1 min-h-0 overflow-hidden">
                        <div className="mb-2 md:mb-6 flex-shrink-0">
                          <img
                            src={favorite.logoUrl}
                            alt={favorite.partnerName || favorite.businessName || "Partner"}
                            className="w-[144px] h-[72px] md:w-[240px] md:h-[120px] object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = dashboard1;
                            }}
                          />
                        </div>
                        <h3 className="text-[18px] md:text-[24px] font-bold text-[#000000] mb-2 md:mb-5 px-4 flex-shrink-0">
                          {favorite.partnerName ||
                            favorite.businessName}
                        </h3>
                        {favorite.descriptionShort && (
                          <div className="flex items-start justify-center w-full mb-2 md:mb-6 overflow-hidden flex-1 min-h-0">
                            <p className="text-[#000000] font-[400] text-[12px] leading-[1.4] md:text-[14px] md:leading-[1.6] line-clamp-4 md:line-clamp-5">
                              {favorite.descriptionShort}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleFavoriteMoreInfo(favorite)}
                        className="flex-shrink-0 mt-auto font-bold text-[14px] md:text-[16px] cursor-pointer transition-all duration-200 text-black hover:font-extrabold"
                      >
                        {t("userDashboard.moreInfo")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 max-w-7xl px-4 md:px-7 w-full overflow-visible">
                <div className="col-span-3 flex justify-center items-center h-64">
                  <div className="text-white text-lg text-center">
                    {t("userDashboard.noFavorites")}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

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
                <div className="text-sm font-extrabold">{t("userDashboard.dateLabel")}</div>
                <div className="text-sm">
                  {formatConvDate(openConversation.createdDate)}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">{t("userDashboard.partnerLabel")}</div>
                <div className="text-sm">
                  {openConversation.partnerName || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">{t("userDashboard.subjectLabel")}</div>
                <div className="text-sm">
                  {openConversation.messageSubject || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold">{t("userDashboard.descriptionLabel")}</div>
                <div className="text-sm leading-relaxed">
                  {openConversation.messageContent || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}