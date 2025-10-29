import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import userDashboard from "/src/assets/userImages/user-supplier.png";
// import userHeader from "/src/assets/userImages/userHeader.png";
// import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";

// Category images
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { http } from "../services/http.service";
import { partnerService } from "../services/partner.service";

interface SubCategoryData {
  id: number;
  category: string;
  categoryDescription: string;
  subCategory: string;
  subCategoryDescription: string;
  categoryIconUrl?: string;
  subCategoryIconUrl?: string;
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
  email,
  mobileNo,
  category,
  subCategory,
  description,
  onMoreInfo,
  isLoading = false,
}) => (
  <div className="bg-white rounded-[10px] shadow-md hover:shadow-lg transition-shadow duration-300 w-[413px] flex flex-col items-center p-6 text-center gap-2">
    <div className="mb-2">
      <img
        src={logoUrl}
        alt={name || fullName || "Partner"}
        className="w-[99px] h-[77px] object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = JimmysELservice;
        }}
      />
    </div>
    <h3 className="text-[20px] font-[800] text-[#000000] truncate max-w-full">
      {name || fullName || "Partner"}
    </h3>
    {fullName && name && (
      <p className="text-sm text-[#111827] -mt-1">{fullName}</p>
    )}
    <div className="text-[13px] text-[#111827] space-y-1">
      {email && <p className="truncate">{email}</p>}
      {mobileNo && <p>{mobileNo}</p>}
    </div>
    {(category || subCategory) && (
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {category && (
          <span className="px-2 py-1 bg-[#E5F4EA] text-[#0B3B35] text-[12px] rounded-md">
            {category}
          </span>
        )}
        {subCategory && (
          <span className="px-2 py-1 bg-[#F1F5F9] text-[#0B3B35] text-[12px] rounded-md">
            {subCategory}
          </span>
        )}
      </div>
    )}
    {description && (
      <p className="text-[#000000] leading-relaxed font-[400] text-[13px] line-clamp-3 mt-1">
        {description}
      </p>
    )}
    <button
      onClick={onMoreInfo}
      disabled={isLoading}
      className={`font-bold mt-3 hover:underline cursor-pointer railways ${
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
  const [active, setActive] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [loadingPartnerId, setLoadingPartnerId] = useState<number | null>(null);

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
        const res: any = await http.get(
          "/SubCategories/getPartnerBySubCategoryId",
          { subCategoryId: active }
        );
        const list = (res?.output?.result ?? res?.output ?? res) || [];
        setPartners(Array.isArray(list) ? list : []);
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
        {loading ? (
          <div className="text-white">Loading subcategories...</div>
        ) : subCategories.length > 0 ? (
          subCategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActive(sub.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 text-white cursor-pointer
              ${
                active === sub.id
                  ? "bg-[#b6e924] text-black shadow-lg scale-105"
                  : "hover:text-[#b6e924] hover:bg-white/10"
              }`}
            >
              {sub.subCategoryIconUrl && (
                <img
                  src={sub.subCategoryIconUrl}
                  alt={sub.subCategory}
                  className="w-6 h-6 rounded object-contain bg-white/80"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              )}
              <span className="text-lg font-semibold">{sub.subCategory}</span>
            </button>
          ))
        ) : (
          <div className="text-white">No subcategories available</div>
        )}
      </section>

      <section className="bg-[#0b3b35] w-full flex justify-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl px-8 w-full">
          {partnersLoading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading partners...</div>
            </div>
          ) : partners.length > 0 ? (
            <>
              {partners.map((p) => (
                <div key={p.partnerSubCategoryId ?? p.partnerId} className="flex justify-center">
                  <PartnerCard
                    logoUrl={p.logoUrl}
                    name={p.businessName}
                    fullName={p.fullName}
                    email={p.email}
                    mobileNo={p.mobileNo}
                    category={p.category}
                    subCategory={p.subCategory}
                    description={p.descriptionShort}
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
