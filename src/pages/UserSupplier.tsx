import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import userDashboard from "/src/assets/userImages/user-supplier.png";
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { subCategoriesService } from "../services/subCategories.service";
import { partnerService } from "../services/partner.service";
import footerLogo from "/src/assets/userImages/footerLogo.svg";
import subCategoryGradient from "/src/assets/userImages/subCatGradient.png";

interface SubCategoryData {
  id: number;
  category: string;
  categoryDescription: string;
  subCategory: string;
  subCategoryDescription: string;
  categoryIconUrl?: string;
  subCategoryIconUrl?: string;
  subCategoryImageUrl?: string;
}

interface PartnerItem {
  partnerId: number;
  partnerSubCategoryId?: number;
  businessName?: string;
  descriptionShort?: string;
  logoUrl?: string;
  address?: string;
  fullName?: string;
  email?: string;
  mobileNo?: string;
  category?: string;
  subCategory?: string;
  categoryId?: number;
  subCategoryId?: number;
}

type PartnerCardProps = {
  logoUrl?: string;
  name?: string;
  fullName?: string;
  email?: string;
  mobileNo?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  onMoreInfo?: () => void;
  isLoading?: boolean;
};

const PartnerCard: React.FC<PartnerCardProps> = ({
  logoUrl,
  name,
  fullName,
  description,
  onMoreInfo,
  isLoading = false,
}) => (
  <div className="bg-white rounded-[10px] shadow-md hover:shadow-lg transition-shadow duration-300 w-[413px] h-[453px] flex flex-col items-center px-8 py-10 text-center">
    <div className="mb-6">
      <img
        src={logoUrl}
        alt={name || fullName || "Partner"}
        className="w-[120px] h-[120px] object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = JimmysELservice;
        }}
      />
    </div>
    <h3 className="text-[24px] font-bold text-[#000000] mb-4 px-4">
      {name || fullName || "Partner"}
    </h3>
    {description && (
      <div className="flex-1 flex items-start justify-center w-full mb-6 overflow-hidden">
        <p className="text-[#000000] leading-[1.6] font-[400] text-[14px] line-clamp-6">
          {description}
        </p>
      </div>
    )}
    <button
      onClick={onMoreInfo}
      disabled={isLoading}
      className={`font-bold text-[16px] hover:underline cursor-pointer ${
        isLoading ? "text-gray-400 cursor-not-allowed" : "text-black"
      }`}
    >
      {isLoading ? "Loading..." : "More info"}
    </button>
  </div>
);

const UserSupplier = () => {
  const location = useLocation();
  const categoryName = (location as any)?.state?.categoryName as
    | string
    | undefined;
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  console.log("isScrolled", isScrolled);
  const [active, setActive] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [loadingPartnerId, setLoadingPartnerId] = useState<number | null>(null);

  // Get the background image for the active subcategory
  const getBackgroundImage = () => {
    if (!active) return userDashboard;

    const activeSubCategory = subCategories.find((sub) => sub.id === active);
    return activeSubCategory?.subCategoryImageUrl || userDashboard;
  };

  useEffect(() => {
    const userData = localStorage.getItem("bm_user");
    const partnerData = localStorage.getItem("bm_partner");

    if (!userData && !partnerData) {
      navigate("/");
    }
  }, []);

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
          // select first subcategory by default
          setActive(parsedData.output?.[0]?.id ?? null);
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

  const handlePartnerMoreInfo = async (partner: PartnerItem) => {
    try {
      setLoadingPartnerId(partner.partnerId);
      const detail = await partnerService.getById(partner.partnerId);
      console.log("Partner detail response:", detail);
      localStorage.setItem("bm_currentPartner", JSON.stringify(detail));
      navigate("/supplier-profile");
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Failed to load partner details. Please try again.");
    } finally {
      setLoadingPartnerId(null);
    }
  };

  // Fetch partners for active subcategory
  useEffect(() => {
    const fetchPartners = async () => {
      if (!active) {
        setPartners([]);
        return;
      }
      try {
        setPartnersLoading(true);
        const list = await subCategoriesService.getPartnersBySubCategoryId(
          active
        );
        setPartners(list);
      } catch (error) {
        console.error("Error fetching partners:", error);
        setPartners([]);
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchPartners();
  }, [active]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="relative h-[100vh]"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[rgba(22,89,51,0)] to-[#043428] pointer-events-none" /> */}
      <div className="absolute bottom-0">
        <img src={subCategoryGradient} alt="" />
      </div>
      {categoryName && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {categoryName}
          </h1>
        </div>
      )}
      <section className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-4 w-full p-2">
        {loading ? (
          <div className="text-white">Loading subcategories...</div>
        ) : subCategories.length > 0 ? (
          subCategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActive(sub.id)}
              className={`flex items-center gap-1 md:gap-[8px] px-3 md:px-2 py-2 rounded-[8px] transition-all duration-200 text-white cursor-pointer whitespace-nowrap border border-transparent
              ${
                active === sub.id
                  ? "bg-[#95C11F] text-black shadow-md"
                  : "bg-transparent hover:bg-white/10 hover:text-[#b6e924]"
              }`}
              aria-pressed={active === sub.id}
              title={sub.subCategory}
            >
              {sub.subCategoryIconUrl && (
                <img
                  src={sub.subCategoryIconUrl}
                  alt={sub.subCategory}
                  className={`w-[24px] h-[24px] md:w-[28px] md:h-[28px] relative opacity-100 rounded object-contain ${
                    active === sub.id ? "" : "brightness-0 invert"
                  }`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              )}
              <span className="text-[20px] font-[600] figtree">
                {sub.subCategory}
              </span>
            </button>
          ))
        ) : (
          <div className="text-white">No subcategories available</div>
        )}
      </section>

      <section className="bg-[#01351f] w-full flex justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl px-12 w-full">
          {partnersLoading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading partners...</div>
            </div>
          ) : partners.length > 0 ? (
            <>
              {partners.map((p) => (
                <div
                  key={p.partnerSubCategoryId ?? p.partnerId}
                  className="flex justify-center"
                >
                  <PartnerCard
                    logoUrl={p.logoUrl}
                    name={p.businessName}
                    fullName={p.fullName}
                    email={p.email}
                    mobileNo={p.mobileNo}
                    category={p.category}
                    subCategory={p.subCategory}
                    description={p.descriptionShort?.trim() || "NA"}
                    onMoreInfo={() => handlePartnerMoreInfo(p)}
                    isLoading={loadingPartnerId === p.partnerId}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">
                No partners found for this subcategory
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#01351f] text-white text-center p-4">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-[199px] h-[45px] mx-auto">
                <img
                  src={footerLogo}
                  alt="Boligmatch Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <p className="text-white text-sm figtree font-[400] text-[18px]">
            Tørringvej 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR
            33160437
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserSupplier;
