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
      <div className="bg-[#01351f] py-5 sm:py-5 md:py-5 flex-1">
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
                     className="
                    w-full
                    max-w-[360px]
                    md:max-w-none
                    mx-auto
                    md:h-[530px]
                    rounded-xl
                    transition-all
                    duration-300
                    cursor-pointer
                    overflow-hidden
                    hover:shadow-xl
                    hover:scale-[1.02]
                    flex
                    flex-col
                    bg-gradient-to-t from-white via-white to-transparent
  "
>
  {/* IMAGE SECTION */}
  <div className="relative h-[340px] w-full overflow-hidden">
    <img
      src={category.imageUrl || assets.image}
      alt={category.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = assets.image;
      }}
    />

    <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-white to-transparent"></div>

    <div className="absolute bottom-0 left-0 right-0">
      <img src={categoryGradientImg} alt="" className="w-full h-auto" />
    </div>
  </div>

  {/* CONTENT SECTION */}
  <div className="flex-1 p-5 text-center flex flex-col items-center justify-center gap-2">
    {/* ICON */}
    <div className="w-16 h-14 flex items-center justify-center -mt-6">
      <img
        src={category.iconUrl || assets.icon}
        alt={category.name}
        className="w-14 h-14 object-contain"
        onError={(e) => {
          e.currentTarget.src = assets.icon;
        }}
      />
    </div>

    {/* TITLE */}
    <h3 className="text-xl font-extrabold text-[#052011] line-clamp-1">
      {category.name}
    </h3>

    {/* DESCRIPTION */}
    <p className="text-sm text-[#052011] leading-[20px] px-2 line-clamp-3">
      {category.description}
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
