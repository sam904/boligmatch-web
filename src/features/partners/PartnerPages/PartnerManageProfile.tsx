import { useEffect, useRef, useState } from "react";
import profileIcon from "/src/assets/userImages/profileIcon.svg";
import PartnerHeader from "./PartnerHeader";
import Footer from "../../../pages/Footer";
import { useTranslation } from "react-i18next";
import { partnerService } from "../../../services/partner.service";
import { userService } from "../../../services/user.service";
import {
  showSignupErrorToast,
  showSignupSuccessToast,
} from "../../../components/common/ToastBanner";
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Validation function for name fields
  const isValidName = (name: string): boolean => {
    if (!name.trim()) return true;
    const nameRegex = /^[a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]+$/;
    return nameRegex.test(name);
  };

  // Validation function for business name (allows more characters like &, numbers, etc.)
  const isValidBusinessName = (name: string): boolean => {
    if (!name.trim()) return true;
    const businessNameRegex = /^[a-zA-ZÀ-ÿÆØÅæøå0-9\s'\-\.&,()]+$/;
    return businessNameRegex.test(name);
  };

  // Filter invalid characters from name input
  const filterNameInput = (value: string): string => {
    return value.replace(/[^a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]/g, "");
  };

  // Filter invalid characters from business name input
  const filterBusinessNameInput = (value: string): string => {
    return value.replace(/[^a-zA-ZÀ-ÿÆØÅæøå0-9\s'\-\.&,()]/g, "");
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

    fetchPartnerProfile();
  }, []);

  const fetchPartnerProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem("bm_access");
      if (!token || !token.includes(".")) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      const decodedPartnerId = Number(payload?.partnerId);
      const response: any = await partnerService.getById(
        decodedPartnerId ? decodedPartnerId : 0
      );
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
      showSignupErrorToast(t("manageProfile.toast.fetchProfileError"));
    } finally {
      setIsLoadingProfile(false);
      return;
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
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

    setIsSavingProfile(true);

    const payload: PartnerDto = {
      id: partnerId,
      userId: 0,
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
      await partnerService.updateProfile(payload);
      await fetchPartnerProfile();
      showSignupSuccessToast(t("manageProfile.toast.profileUpdateSuccess"));
        navigate("/partner/statistics");
    } catch (error) {
      console.error("Failed to update partner profile", error);
      showSignupErrorToast("Failed to update partner profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      showSignupErrorToast(t("manageProfile.toast.passwordRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      showSignupErrorToast(t("manageProfile.toast.passwordMismatch"));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await userService.resetUserPassword({
        email: email,
        newPassword: newPassword,
      });

      showSignupSuccessToast(t("manageProfile.toast.passwordUpdateSuccess"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to reset password", err);
      showSignupErrorToast(t("manageProfile.toast.passwordUpdateError"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Loading skeleton
  if (isLoadingProfile) {
    return (
      <div className="min-h-[100vh] bg-[#01351f]">
        <PartnerHeader fullHeight={false} />
        <div className="max-w-5xl mx-auto px-5 py-4">
          <div className="flex flex-col items-center">
            <div className="w-[40px] h-[78px] mb-3 bg-gray-300 animate-pulse rounded"></div>
            <div className="h-6 w-48 bg-gray-300 animate-pulse rounded mb-6"></div>
          </div>

          {/* Skeleton for profile form */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={i === 4 ? "md:col-span-2" : ""}>
                  <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-2"></div>
                  <div className="h-12 bg-gray-300 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-gray-300 animate-pulse rounded mt-4"></div>
          </div>

          {/* Skeleton for password form */}
          <div className="mt-8 space-y-4">
            <div className="h-5 w-48 bg-gray-300 animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={i === 0 ? "md:col-span-2" : ""}>
                  <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-2"></div>
                  <div className="h-12 bg-gray-300 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-gray-300 animate-pulse rounded mt-4"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

        <form className="mt-6 space-y-4" onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.fullName") || t("manageProfile.firstName")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200 disabled:text-gray-500"
                value={fullName}
                onChange={(e) => setFullName(filterNameInput(e.target.value))}
                disabled
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.businessName") || t("partners.businessName")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(filterBusinessNameInput(e.target.value))
                }
                disabled={isSavingProfile}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("partnerDetails.address") || t("common.address")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSavingProfile}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.phone")}
              </label>
              <input
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                value={phone}
                maxLength={8}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                  setPhone(onlyDigits);
                }}
                disabled={isSavingProfile}
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
              disabled={isSavingProfile}
              className="w-full bg-[#95C11F] hover:bg-[#7fb32d] text-white font-semibold rounded-full py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("common.saving")}
                </>
              ) : (
                t("manageProfile.saveChanges")
              )}
            </button>
          </div>
        </form>

        <form className="mt-8 space-y-4" onSubmit={handlePasswordChange}>
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
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">
                {t("manageProfile.confirmPassword")}
              </label>
              <input
                type="password"
                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-[#95C11F] hover:bg-[#7fb32d] text-white font-semibold rounded-full py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("common.updating")}
                </>
              ) : (
                t("manageProfile.updatePassword")
              )}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default PartnerManageProfile;
