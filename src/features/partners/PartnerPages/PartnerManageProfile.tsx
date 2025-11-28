import { useEffect, useRef, useState } from "react";
import profileIcon from "/src/assets/userImages/profileIcon.png";
import PartnerHeader from "./PartnerHeader";
import Footer from "../../../pages/Footer";
import { useTranslation } from "react-i18next";
import { partnerService } from "../../../services/partner.service";
import { showSignupErrorToast, showSignupSuccessToast } from "../../../components/common/ToastBanner";
import type { PartnerDto } from "../../../types/partner";
import { useNavigate } from "react-router-dom";

function PartnerManageProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cvr, setCvr] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasFetchedRef = useRef(false);

  // Validation function for name fields
  const isValidName = (name: string): boolean => {
    if (!name.trim()) return true; // Allow empty (optional fields)
    // Allow letters (including accented), spaces, hyphens, apostrophes, and periods
    const nameRegex = /^[a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]+$/;
    return nameRegex.test(name);
  };

  // Validation function for business name (allows more characters like &, numbers, etc.)
  const isValidBusinessName = (name: string): boolean => {
    if (!name.trim()) return true; // Allow empty (optional field)
    // Allow letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, commas, and parentheses
    const businessNameRegex = /^[a-zA-ZÀ-ÿÆØÅæøå0-9\s'\-\.&,()]+$/;
    return businessNameRegex.test(name);
  };

  // Filter invalid characters from name input
  const filterNameInput = (value: string): string => {
    // Remove invalid characters, keep only letters, spaces, hyphens, apostrophes, and periods
    return value.replace(/[^a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]/g, '');
  };

  // Filter invalid characters from business name input
  const filterBusinessNameInput = (value: string): string => {
    // Remove invalid characters, keep letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, commas, and parentheses
    return value.replace(/[^a-zA-ZÀ-ÿÆØÅæøå0-9\s'\-\.&,()]/g, '');
  };

  useEffect(() => {
    const storedPartner = localStorage.getItem("bm_partner");
    if (!storedPartner) {
      navigate("/partner/statistics", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const decodeToken = () => {
      try {
        const token = localStorage.getItem("bm_access");
        if (!token || !token.includes(".")) return null;
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));
        const decodedPartnerId = Number(payload?.partnerId);
        return Number.isFinite(decodedPartnerId) ? decodedPartnerId : null;
      } catch (error) {
        console.error("Failed to decode bm_access token:", error);
        return null;
      }
    };

    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const id = decodeToken();
    if (!id) return;
    setPartnerId(id);

    const fetchPartnerProfile = async () => {
      try {
        const response: any = await partnerService.getById(id);
        const partner = response?.output ?? response;
        const derivedFullName = partner?.fullName ?? partner?.businessName ?? "";

        setFullName(derivedFullName);
        setBusinessName(partner?.businessName ?? "");
        setPhone(partner?.mobileNo ?? "");
        setEmail(partner?.email ?? "");
        setAddress(partner?.address ?? "");
        setCategoryId(partner?.categoryId ?? null);
        setCvr(partner?.cvr ?? null);
      } catch (error) {
        console.error("Failed to fetch partner profile:", error);
      }
    };

    fetchPartnerProfile();
  }, []);

  return (
    <div className="min-h-[100vh] bg-[#01351f]">
      <PartnerHeader fullHeight={false} />
      <div className="max-w-5xl mx-auto px-5 py-4">
        <div className="flex flex-col items-center">
          <img
            src={profileIcon}
            alt="profile icon"
            className="w-[40px] h-[78px] mb-3"
          />
          <h1 className="text-white text-[16px] font-[800]">
            {t("manageProfile.title")}
          </h1>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            
            // Validate name fields
            if (fullName.trim() && !isValidName(fullName)) {
              showSignupErrorToast(t("manageProfile.toast.fullNameInvalid"));
              return;
            }
            if (!isValidBusinessName(businessName)) {
              showSignupErrorToast(t("manageProfile.toast.businessNameInvalid"));
              return;
            }
            
            if (!partnerId || !categoryId) {
              showSignupErrorToast("Partner data is incomplete.");
              return;
            }

            const payload: PartnerDto = {
              id: partnerId,
              userId: 0, // Keep it or update if necessary
              categoryId,
              businessName,
              address,
              email,
              mobileNo: phone,
              businessUnit: 0,
              cvr: cvr ?? 0,
              descriptionShort: "",
              textField1: "",
              textField2: "",
              textField3: "",
              textField4: "",
              textField5: "",
              isActive: true,
              status: "Active",
            };

            try {
              await partnerService.update(payload);
              showSignupSuccessToast("Partner profile updated successfully");
            } catch (error) {
              console.error("Failed to update partner profile", error);
              showSignupErrorToast("Failed to update partner profile");
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.fullName") || t("manageProfile.firstName")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={fullName}
                onChange={(e) => setFullName(filterNameInput(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.businessName") || t("partners.businessName")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={businessName}
                onChange={(e) => setBusinessName(filterBusinessNameInput(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.address") || t("common.address")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.phone")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={phone}
                maxLength={8}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                  setPhone(onlyDigits);
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.email")}
              </label>
              <input
                type="email"
                className="w-full rounded-md bg-white disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 px-4 py-2.5 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#95C11F] text-white font-semibold rounded-full py-2.5 cursor-pointer"
            >
              {t("manageProfile.saveChanges")}
            </button>
          </div>
        </form>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // Intentionally left blank; integrate API logic when ready.
          }}
        >
          <h2 className="text-white text-[14px] font-[700]">
            {t("manageProfile.changePasswordTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-white text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-md bg-white disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 px-4 py-2.5 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.newPassword")}
              </label>
              <input
                type="password"
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.confirmPassword")}
              </label>
              <input
                type="password"
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#95C11F] text-white font-semibold rounded-full py-2.5 cursor-pointer"
            >
              {t("manageProfile.updatePassword")}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default PartnerManageProfile;
