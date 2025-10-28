import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import userDashboard from "/src/assets/userImages/user-supplier.png";
// import userHeader from "/src/assets/userImages/userHeader.png";
// import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";

// Category images
import Elektriker from "../assets/userSupplier/Elektriker.png";
import Fugemand from "../assets/userSupplier/Fugemand.png";
import Glarmester from "../assets/userSupplier/Glarmester.png";
import Handyman from "../assets/userSupplier/Handyman.png";
import Maler from "../assets/userSupplier/Maler.png";
import Tomrer from "../assets/userSupplier/Tømrer.png";
import Murer from "../assets/userSupplier/Murer.png";
import VVS from "../assets/userSupplier/VVS.png";
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useNavigate } from "react-router-dom";
import { subCategoryService } from "../services/subCategory.service";
import { toast } from "react-toastify";

interface Category {
  name: string;
  icon: string;
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface SubCategoryData {
  id: number;
  category: string;
  categoryDescription: string;
  subCategory: string;
  subCategoryDescription: string;
}

// --- Card component ---
type ServiceCardProps = Service & {
  onMoreInfo: () => void;
  subCategoryId?: number;
  isLoading?: boolean;
};
const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  onMoreInfo,
  isLoading = false,
}) => (
  <div className="bg-white rounded-[10px] shadow-md hover:shadow-lg transition-shadow duration-300 w-[413px] h-[453px] flex flex-col items-center justify-between p-8 text-center">
    <div className="mt-[48.46px]">
      <img src={icon} alt={title} className="w-[99px] h-[77px]" />
    </div>

    <div className="flex-1 flex flex-col justify-center">
      <h3 className="text-[30px] font-[700] text-[#000000] mb-3">{title}</h3>
      <p className="text-[#000000] leading-relaxed font-[400] text-16px">
        {description}
      </p>
    </div>

    <button
      onClick={onMoreInfo}
      disabled={isLoading}
      className={`font-bold mt-6 mb-4 hover:underline cursor-pointer railways ${
        isLoading ? "text-gray-400 cursor-not-allowed" : "text-black"
      }`}
    >
      {isLoading ? "Loading..." : "More info"}
    </button>
  </div>
);

const UserSupplier = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  console.log("isScrolled", isScrolled);
  const [active, setActive] = useState("Elektriker");
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubCategory, setLoadingSubCategory] = useState<number | null>(
    null
  );

  const categories: Category[] = [
    { name: "Tømrer", icon: Tomrer },
    { name: "Murer", icon: Murer },
    { name: "Elektriker", icon: Elektriker },
    { name: "Maler", icon: Maler },
    { name: "VVS", icon: VVS },
    { name: "Glarmester", icon: Glarmester },
    { name: "Handyman", icon: Handyman },
    { name: "Fugemand", icon: Fugemand },
  ];

  // Load subcategories from localStorage
  useEffect(() => {
    const loadSubCategories = () => {
      try {
        const subCategoriesData = localStorage.getItem("bm_subcategories");
        console.log(
          "Raw subcategories data from localStorage:",
          subCategoriesData
        );
        if (subCategoriesData) {
          const parsedData = JSON.parse(subCategoriesData);
          setSubCategories(parsedData.output);
        } else {
          console.log("No subcategories data found in localStorage");
        }
      } catch (error) {
        console.error("Error loading subcategories from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubCategories();
  }, []);
  const handleMoreInfo = async (subCategoryId: number) => {
    try {
      setLoadingSubCategory(subCategoryId);
      const subCategoryDetails = await subCategoryService.getById(
        subCategoryId
      );
      localStorage.setItem(
        "bm_currentSubCategory",
        JSON.stringify(subCategoryDetails)
      );
      navigate("/userProfile/supplier-profile");
    } catch (error) {
      console.error("Error fetching subcategory details:", error);
      toast.error("Failed to load subcategory details. Please try again.");
    } finally {
      setLoadingSubCategory(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="h-[100vh]"
      style={{
        backgroundImage: `url(${userDashboard})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      <section className="bg-[#043428] py-12 px-8 flex flex-wrap justify-center gap-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActive(cat.name)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 text-white cursor-pointer
              ${
                active === cat.name
                  ? "bg-[#b6e924] text-black shadow-lg scale-105"
                  : "hover:text-[#b6e924] hover:bg-white/10"
              }`}
          >
            <img src={cat.icon} alt={cat.name} className="w-7 h-7" />
            <span className="text-lg font-semibold">{cat.name}</span>
          </button>
        ))}
      </section>

      <section className="bg-[#0b3b35] w-full flex justify-center py-12">
        <div className="grid grid-cols-3 gap-10 max-w-7xl px-8">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading subcategories...</div>
            </div>
          ) : subCategories.length > 0 ? (
            <>
              {subCategories.map((subCategory, idx) => (
                <div
                  key={idx}
                  className="w-[413px] h-[453px] rounded-[10px] flex justify-center items-center"
                >
                  <ServiceCard
                    icon={JimmysELservice}
                    title={subCategory.subCategory}
                    description={subCategory.subCategoryDescription}
                    subCategoryId={subCategory.id}
                    isLoading={loadingSubCategory === subCategory.id}
                    onMoreInfo={() => handleMoreInfo(subCategory.id)}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">
                No subcategories available
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#0b3b35] text-white text-center p-4">
        <div className="flex flex-col items-center">
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
      </footer>
    </div>
  );
};

export default UserSupplier;
