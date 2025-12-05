import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  categoryService,
  type Category,
} from "../../../services/category.service";
import dashboard1 from "/src/assets/userImages/dashboard1.svg";
import dashboard2 from "/src/assets/userImages/dashboard1.svg";
import dashboard3 from "/src/assets/userImages/dashboard1.svg";
import dashboardIcon1 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon2 from "/src/assets/userImages/userDashboardicon1.svg";
import dashboardIcon3 from "/src/assets/userImages/userDashboardicon1.svg";
import { useNavigate } from "react-router-dom";
import { subCategoriesService } from "../../../services/subCategories.service";
import categoryGradientImg from "/src/assets/userImages/categoryGradient.svg";
import Footer from "../../../pages/Footer";

function SearchForPartner() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const calledRef = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkPartnerData = () => {
      try {
        const storedPartner = localStorage.getItem("bm_partner");
        if (storedPartner) {
          const partner = JSON.parse(storedPartner);
          setPartnerData(partner);
          console.log("partner", partner);
        }
      } catch (error) {
        console.error("Error parsing partner data:", error);
      }
    };

    checkPartnerData();

    // Optional: Listen for storage changes
    window.addEventListener("storage", checkPartnerData);
    return () => window.removeEventListener("storage", checkPartnerData);
  }, []);
  useEffect(() => {
    if (calledRef.current) {
      return;
    }
    calledRef.current = true;

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
      partnerData
        ? navigate("/partner/user-supplier", {
            state: { categoryId: category.id, categoryName: category.name },
          })
        : navigate("/user/user-supplier", {
            state: { categoryId: category.id, categoryName: category.name },
          });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      partnerData
        ? navigate("/partner/user-supplier", {
            state: { categoryId: category.id, categoryName: category.name },
          })
        : navigate("/user/user-supplier", {
            state: { categoryId: category.id, categoryName: category.name },
          });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#01351f] py-8 sm:py-12 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">{t("common.loading")}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-4">
                {categories.map((category, index) => {
                  const assets = getCategoryAssets(index);
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="w-[374px] h-[394px] md:w-auto md:h-auto mx-auto rounded-[18px] md:rounded-xl bg-white transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl"
                    >
                      <div className="relative w-full h-[222px] md:h-56 lg:h-64 xl:h-72 rounded-t-[18px] md:rounded-t-xl overflow-hidden">
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
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SearchForPartner;
