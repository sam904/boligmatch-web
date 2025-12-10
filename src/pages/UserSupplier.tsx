import { useEffect, useRef, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import userDashboard from "/src/assets/userImages/user-supplier.svg";
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.svg";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { subCategoriesService } from "../services/subCategories.service";
import { partnerService } from "../services/partner.service";
// import footerLogo from "/src/assets/userImages/footerLogo.svg";
import nextArrow from "/src/assets/userImages/arrow_right.svg";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

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
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full  h-[262px] md:w-[413px] md:h-[453px] flex flex-col items-center px-6 py-6 md:px-8 md:py-10 text-center justify-between">
      <div className="flex flex-col items-center w-full">
        <div className="mb-3 md:mb-6">
          <img
            src={logoUrl}
            alt={name || fullName || "Partner"}
            className="w-[72px] h-[72px] md:w-[120px] md:h-[120px] object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = JimmysELservice;
            }}
          />
        </div>
        <h3 className="text-[18px] md:text-[24px] font-bold text-[#000000] mb-2 md:mb-4 px-4">
          {name || fullName || "Partner"}
        </h3>
        {description && (
          <div className="flex-1 flex items-start justify-center w-full mb-3 md:mb-6 overflow-hidden min-h-0">
            <p className="text-[#000000] font-[400] text-[12px] leading-[1.4] md:text-[14px] md:leading-[1.6] line-clamp-3 md:line-clamp-6">
              {description}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={onMoreInfo}
        disabled={isLoading}
        className={`mt-auto font-bold text-[14px] md:text-[16px] cursor-pointer transition-all duration-200 ${isLoading
            ? "text-gray-400 cursor-not-allowed font-semibold"
            : "text-black hover:font-extrabold"
          }`}
      >
        {isLoading ? t("common.loading") : t("userDashboard.moreInfo")}
      </button>
    </div>
  );
};

const UserSupplier = () => {
  const location = useLocation();
  const categoryName = (location as any)?.state?.categoryName as
    | string
    | undefined;
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  console.log("isScrolled", isScrolled);
  const { t } = useTranslation();
  const [active, setActive] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [loadingPartnerId, setLoadingPartnerId] = useState<number | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  
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
      partnerData
        ? navigate("/partner/supplier-profile")
        : navigate("/user/supplier-profile");
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
    <>
      <div
        className="
              h-[60vh] md:h-screen 
              bg-no-repeat md:bg-cover bg-cover
              md:bg-center bg-center
            "
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
        }}
      >
        <style>{`
        @media (max-width: 767px) {
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        }
      `}</style>
        <UserHeader />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-20 md:top-auto md:h-[400px] h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(1, 53, 31, 0) 0%, #01351F 100%)",
          }}
        />
        {categoryName && (
          <div className="absolute z-10 pointer-events-none inset-x-0 top-32 md:inset-0 md:flex md:items-center md:justify-center px-4">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {categoryName}
            </h1>
          </div>
        )}
        {/* Mobile: horizontal scroll bar styled like the screenshot */}
        <section className="absolute bottom-0 left-0 right-0 md:hidden pb-4">
          <div className="bg-[#01351F] w-full py-3 px-4">
            <div
              ref={mobileScrollRef}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar py-4 relative "
            >
              {loading ? (
                <div className="text-white text-sm">
                  {t("userSupplier.loadingSubcategories")}
                </div>
              ) : subCategories.length > 0 ? (
                subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActive(sub.id)}
                    className={`flex flex-col items-center gap-1 py-2  rounded-[8px] transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent min-w-[80px]
                  ${active === sub.id
                        ? "bg-[#95C11F] text-white shadow-md px-3"
                        : "bg-transparent text-white hover:bg-white/10 px-3"
                      }`}
                    aria-pressed={active === sub.id}
                    title={sub.subCategory}
                  >
                    {sub.subCategoryIconUrl && (
                      <img
                        src={sub.subCategoryIconUrl}
                        alt={sub.subCategory}
                        className={`w-[20px] h-[20px] object-contain ${active === sub.id ? "" : "brightness-0 invert"}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    )}
                    <span className="figtree font-[600] text-[12px] leading-[100%] tracking-normal text-center align-middle">
                      {sub.subCategory}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-white text-sm">
                  {t("userSupplier.noSubcategories")}
                </div>
              )}
            </div>
            {subCategories.length > 3 && (
              <button
                type="button"
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[32px] w-[32px] text-white flex items-center justify-center z-10 bg-[#01351F]/80 rounded-full"
                onClick={() =>
                  mobileScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })
                }
              >
                <img className="h-[24px] w-[24px]" src={nextArrow} alt="" />
              </button>
            )}
          </div>
        </section>

        {/* Desktop: keep existing layout and styling unchanged */}
        <section className="absolute h-[120px]  bottom-15 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 hidden md:flex md:flex-nowrap items-center justify-center gap-1 w-full p-2 bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] ">
          {loading ? (
            <div className="text-white">
              {t("userSupplier.loadingSubcategories")}
            </div>
          ) : subCategories.length > 0 ? (
            subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActive(sub.id)}
                className={`flex items-center gap-1 md:gap-[2px] px-[12px] py-[5px] rounded-[8px] transition-all duration-200 text-white cursor-pointer whitespace-nowrap border border-transparent
              ${active === sub.id
                    ? "bg-[#95C11F] text-black shadow-md"
                    : "bg-transparent hover:bg-white/10"
                  }`}
                aria-pressed={active === sub.id}
                title={sub.subCategory}
              >
                {sub.subCategoryIconUrl && (
                  <img
                    src={sub.subCategoryIconUrl}
                    alt={sub.subCategory}
                    className={`w-[32px] h-[32px] md:w-[40px] md:h-[40px] relative opacity-100 rounded object-contain
                  ${active === sub.id ? "" : "brightness-0 invert"}`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}
                <span className="text-[20px] font-[600] pl-2 figtree">
                  {sub.subCategory}
                </span>
              </button>
            ))
          ) : (
            <div className="text-white">{t("userSupplier.noSubcategories")}</div>
          )}
        </section>
      </div>

      {/* Fixed: Added overflow-visible and adjusted z-index to prevent clipping */}
      <section className="bg-[#01351f] w-full flex justify-center pt-8 pb-8 md:pt-2 md:pb-30 relative -mt-0 md:-mt-32 overflow-visible z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 max-w-7xl px-4 md:px-7 w-full overflow-visible">
          {partnersLoading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="text-white text-lg">
                {t("userSupplier.loadingPartners")}
              </div>
            </div>
          ) : partners.length > 0 ? (
            <>
              {partners.map((p) => (
                <div
                  key={p.partnerSubCategoryId ?? p.partnerId}
                  className="flex justify-center overflow-visible"
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
                {t("userSupplier.noPartners")}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Fixed: Reduced negative margin and added z-index to prevent overlap */}
      <div className="relative -mt-4 md:-mt-32 z-10">
        <div className="pt-8 md:pt-0">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default UserSupplier;