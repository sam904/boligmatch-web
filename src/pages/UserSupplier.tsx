import { useEffect, useRef, useState } from "react";
import userDashboard from "/src/assets/userImages/user-supplier.svg";
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.svg";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { subCategoriesService } from "../services/subCategories.service";
import { partnerService } from "../services/partner.service";
import nextArrow from "/src/assets/userImages/arrow_right.svg";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";

interface SubCategoryData {
  id: number;
  category: string;
  categoryDescription: string;
  subCategory: string;
  subCategoryDescription: string;
  bgImageUrl?: string;
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full h-[320px] md:w-[413px] md:h-[453px] flex flex-col items-center px-6 py-4 md:px-8 md:py-10 text-center justify-between">
      <div className="flex flex-col items-center w-full flex-1 min-h-0 overflow-hidden">
        <div className="mb-2 md:mb-6 flex-shrink-0">
          <img
            src={logoUrl}
            alt={name || fullName || "Partner"}
            className="w-[144px] h-[72px] md:w-[240px] md:h-[120px] object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = JimmysELservice;
            }}
          />
        </div>
        <h3 className="text-[18px] md:text-[24px] font-bold text-[#000000] mb-2 md:mb-5 px-4 flex-shrink-0">
          {name || fullName || "Partner"}
        </h3>
        {description && (
          <div className="flex items-start justify-center w-full mb-2 md:mb-6 overflow-hidden flex-1 min-h-0">
            <p className="text-[#000000] font-[400] text-[12px] leading-[1.4] md:text-[14px] md:leading-[1.6] line-clamp-4 md:line-clamp-5">
              {description}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={onMoreInfo}
        disabled={isLoading}
        className={`flex-shrink-0 mt-auto font-bold text-[14px] md:text-[16px] cursor-pointer transition-all duration-200 ${isLoading
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
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const [partnerData, setPartnerData] = useState<any | null>(null);
  const [desktopHasOverflow, setDesktopHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mobileCanScrollLeft, setMobileCanScrollLeft] = useState(false);
  const [mobileCanScrollRight, setMobileCanScrollRight] = useState(false);

  // Get the background image for the active subcategory
  const getBackgroundImage = () => {
    if (!subCategories.length) return userDashboard;

    const activeSubCategory =
      subCategories.find((sub) => sub.id === active) || subCategories[0];

    return activeSubCategory?.bgImageUrl || userDashboard;
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
          const parsedSubCategories: SubCategoryData[] = parsedData.output;

          setSubCategories(parsedSubCategories);

          const savedSelectionRaw = localStorage.getItem("bm_selectedSubcategory");
          let initialActiveId = parsedSubCategories?.[0]?.id ?? null;
          if (savedSelectionRaw) {
            try {
              const savedSelection = JSON.parse(savedSelectionRaw) as {
                id: number;
                category?: string;
              };
              const currentCategory = parsedSubCategories?.[0]?.category;
              const isValidCategory =
                !savedSelection.category ||
                !currentCategory ||
                savedSelection.category === currentCategory;
              const existsInList = parsedSubCategories.some(
                (s) => s.id === savedSelection.id
              );
              if (isValidCategory && existsInList) {
                initialActiveId = savedSelection.id;
              }
            } catch {
              /* empty */
            }
          }

          setActive(initialActiveId);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

  useEffect(() => {
    const checkDesktopScroll = () => {
      if (desktopScrollRef.current) {
        const element = desktopScrollRef.current;
        const hasOverflow =
          element.scrollWidth > element.clientWidth;
        setDesktopHasOverflow(hasOverflow);

        setCanScrollLeft(element.scrollLeft > 0);

        setCanScrollRight(
          element.scrollLeft < element.scrollWidth - element.clientWidth - 1
        );
      }
    };

    const timeoutId = setTimeout(checkDesktopScroll, 150);

    window.addEventListener("resize", checkDesktopScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkDesktopScroll);
    };
  }, [subCategories, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (desktopScrollRef.current) {
        const element = desktopScrollRef.current;
        setCanScrollLeft(element.scrollLeft > 0);
        setCanScrollRight(
          element.scrollLeft < element.scrollWidth - element.clientWidth - 1
        );
      }
    };

    const scrollElement = desktopScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [subCategories, loading]);

  useEffect(() => {
    const checkMobileScroll = () => {
      const element = mobileScrollRef.current;
      if (!element) return;

      setMobileCanScrollLeft(element.scrollLeft > 0);
      setMobileCanScrollRight(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 1
      );
    };

    const scrollElement = mobileScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkMobileScroll);
    }

    const timeoutId = setTimeout(checkMobileScroll, 150);
    window.addEventListener("resize", checkMobileScroll);

    return () => {
      clearTimeout(timeoutId);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkMobileScroll);
      }
      window.removeEventListener("resize", checkMobileScroll);
    };
  }, [subCategories, loading]);
  const shouldShowDesktopArrow =
    desktopHasOverflow || subCategories.length > 8;

  return (
    <>
      <div
        className="
              h-[60vh] md:h-screen 
              bg-no-repeat md:bg-cover bg-cover
              md:bg-center bg-center
              relative overflow-visible
            "
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
        }}
      >
        <style>{`
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
        <UserHeader />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-20 md:top-auto md:h-[400px] h-full z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(1, 53, 31, 0) 0%, rgba(1, 53, 31, 0.4) 40%, rgba(1, 53, 31, 0.8) 70%, #01351F 100%)",
          }}
        />
        {categoryName && (
          <div className="absolute z-10 pointer-events-none inset-x-0 top-56 md:inset-0 md:flex md:items-center md:justify-center px-4">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {categoryName}
            </h1>
          </div>
        )}
        <section className="absolute bottom-0 left-0 right-0 md:hidden z-20 pointer-events-auto pb-4">
          <div className="w-full py-3 px-4 relative">
            <div
              ref={mobileScrollRef}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar py-4 relative"
            >
              {loading ? (
                <div className="text-white text-sm">
                  {t("userSupplier.loadingSubcategories")}
                </div>
              ) : subCategories.length > 0 ? (
                subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActive(sub.id);
                      try {
                        localStorage.setItem(
                          "bm_selectedSubcategory",
                          JSON.stringify({ id: sub.id, category: sub.category })
                        );
                      } catch { /* empty */ }
                    }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-[8px] transition-all duration-200 cursor-pointer whitespace-nowrap border border-transparent md:min-w-[80px]
                        ${active === sub.id
                        ? "bg-[#95C11F] text-white px-3"
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
                    <span className="figtree font-[600] text-[12px]  leading-[100%] tracking-normal text-center align-middle">
                      {sub.subCategory}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-white text-sm text-center w-full flex justify-center">
                  {t("userSupplier.noSubcategories")}
                </div>
              )}
            </div>
            {mobileCanScrollLeft && (
              <button
                type="button"
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-[32px] w-[32px] text-white flex items-center justify-center z-10 bg-[#01351F]/80 rounded-full"
                onClick={() =>
                  mobileScrollRef.current?.scrollBy({
                    left: -200,
                    behavior: "smooth",
                  })
                }
              >
                <img className="h-[24px] w-[24px] -scale-x-100" src={nextArrow} alt="" />
              </button>
            )}
            {mobileCanScrollRight && (
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

        <section className="absolute bottom-26 h-[120px] px-8 hidden md:flex items-center bg-[linear-gradient(180deg,rgba(1,53,31,0)_0%,#01351F_100%)] w-full">
          {canScrollLeft && (
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-[#01351F]/80 text-white z-10"
              onClick={() =>
                desktopScrollRef.current?.scrollBy({
                  left: -240,
                  behavior: "smooth",
                })
              }
            >
              <img className="h-5 w-5 -scale-x-100" src={nextArrow} alt="" />
            </button>
          )}
          <div
            ref={desktopScrollRef}
            className="relative flex items-center justify-center gap-4 md:gap-3 overflow-x-auto no-scrollbar py-4 flex-nowrap whitespace-nowrap w-full"
          >
            {loading ? (
              <div className="text-white">
                {t("userSupplier.loadingSubcategories")}
              </div>
            ) : subCategories.length > 0 ? (
              subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActive(sub.id);
                    localStorage.setItem(
                      "bm_selectedSubcategory",
                      JSON.stringify({ id: sub.id, category: sub.category })
                    );
                  }}
                  className={`flex items-center gap-2  px-4 py-2 rounded-lg transition-all duration-200 border shrink-0
            ${active === sub.id
                      ? "bg-[#95C11F] text-white shadow-md border-transparent"
                      : "bg-transparent text-white hover:bg-white/10 border-transparent"
                    }`}
                  aria-pressed={active === sub.id}
                  title={sub.subCategory}
                >
                  {sub.subCategoryIconUrl && (
                    <img
                      src={sub.subCategoryIconUrl}
                      alt={sub.subCategory}
                      className={`w-8 h-8 object-contain ${active === sub.id ? "" : "brightness-0 invert"
                        }`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <span className="text-[16px] md:text-[18px] font-semibold figtree">
                    {sub.subCategory}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-white">
                {t("userSupplier.noSubcategories")}
              </div>
            )}
          </div>

          {(shouldShowDesktopArrow || canScrollRight) && (
            <button
              type="button"
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-[#01351F]/80 text-white z-10"
              onClick={() =>
                desktopScrollRef.current?.scrollBy({
                  left: 240,
                  behavior: "smooth",
                })
              }
            >
              <img className="h-5 w-5" src={nextArrow} alt="" />
            </button>
          )}
        </section>

      </div>

      <section className="bg-[#01351f] w-full flex justify-center pt-0 pb-8 md:pt-2 md:pb-30 relative md:-mt-32 overflow-visible z-20">
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
              <div className="text-white text-lg text-center">
                {t("userSupplier.noPartners")}
              </div>
            </div>
          )}
        </div>
      </section>
      <div className="relative md:-mt-32 z-10">
        <div className="pt-0 md:pt-0">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default UserSupplier;
