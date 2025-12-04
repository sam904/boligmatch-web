import { useEffect, useState } from "react";
import profileIcon from "/src/assets/userImages/profileIcon.svg";
import UserHeader from "../features/users/UserPages/UserHeader";
import { userService } from "../services/user.service";
import {
  showSignupSuccessToast,
  showSignupErrorToast,
} from "../components/common/ToastBanner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser } from "../features/auth/authSlice";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function ManageProfile() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailVerify, setIsEmailVerify] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Validation function for name fields
  const isValidName = (name: string): boolean => {
    if (!name.trim()) return true;
    const nameRegex = /^[a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]+$/;
    return nameRegex.test(name);
  };

  // Filter invalid characters from name input
  const filterNameInput = (value: string): string => {
    return value.replace(/[^a-zA-ZÀ-ÿÆØÅæøå\s'\-\.]/g, "");
  };

  useEffect(() => {
    const userStr = localStorage.getItem("bm_user");
    if (!userStr) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingProfile(true);
      try {
        // 1) Try from bm_user (stored object)
        const raw = localStorage.getItem("bm_user");
        let id: number | null = null;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed) {
              const candidate = parsed.id ?? parsed.userId;
              if (candidate != null) id = Number(candidate);
            }
          } catch (_) {
            // ignore parse error
          }
        }

        // 2) Fallback: decode bm_access JWT and use payload.id
        if (id == null || Number.isNaN(id)) {
          const token = localStorage.getItem("bm_access");
          if (token && token.includes(".")) {
            try {
              const base64Url = token.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const payload = JSON.parse(atob(base64));
              const candidate = payload?.id ?? payload?.userId;
              if (candidate != null) id = Number(candidate);
            } catch (_) {}
          }
        }

        if (id == null || Number.isNaN(id)) {
          setIsLoadingProfile(false);
          return; // no id available; skip call
        }

        const res: any = await userService.getById(id);
        const user = res?.output ?? res;
        const first = user?.firstName ?? "";
        const last = user?.lastName ?? "";
        setFirstName(first);
        setLastName(last);
        setPhone(user?.mobileNo ?? "");
        setEmail(user?.email ?? "");
        setIsEmailVerify(Boolean(user?.isEmailVerify));
        setIsActive(user?.isActive ?? true);
        setUserId(Number(id));
      } catch (error) {
        console.error("Error fetching user:", error);
        showSignupErrorToast(t("manageProfile.toast.fetchProfileError"));
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUser();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name fields
    if (firstName.trim() && !isValidName(firstName)) {
      showSignupErrorToast(t("manageProfile.toast.firstNameInvalid"));
      return;
    }
    if (lastName.trim() && !isValidName(lastName)) {
      showSignupErrorToast(t("manageProfile.toast.lastNameInvalid"));
      return;
    }

    if (!/^[0-9]{8}$/.test(phone)) {
      showSignupErrorToast(t("manageProfile.toast.phoneDigitsError"));
      return;
    }

    if (userId == null) return;

    setIsSavingProfile(true);

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const payload = {
      id: userId,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email,
      mobileNo: phone,
      isEmailVerify: isEmailVerify,
      isActive: isActive,
      status: isActive ? "Active" : "InActive",
    } as any;

    try {
      await userService.update(payload);
      if (authUser) {
        dispatch(
          setUser({
            ...authUser,
            firstName: firstName,
            lastName: lastName,
            mobileNo: phone,
          })
        );
      }
      showSignupSuccessToast(t("manageProfile.toast.profileUpdateSuccess"));
        navigate("/user/profile");
    } catch (err) {
      console.error("Failed to update profile", err);
      showSignupErrorToast(t("manageProfile.toast.profileUpdateError"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
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
        <UserHeader fullHeight={false} />
        <div className="max-w-5xl mx-auto px-5 py-4">
          <div className="flex flex-col items-center">
            <div className="w-[40px] h-[78px] mb-3 bg-gray-300 animate-pulse rounded"></div>
            <div className="h-6 w-48 bg-gray-300 animate-pulse rounded mb-6"></div>
          </div>

          {/* Skeleton for profile form */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-2"></div>
                  <div className="h-12 bg-gray-300 animate-pulse rounded"></div>
                </div>
              ))}
              {/* Email and Phone field skeletons - both in same row */}
              <div>
                <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-2"></div>
                <div className="h-12 bg-gray-300 animate-pulse rounded"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-300 animate-pulse rounded mb-2"></div>
                <div className="h-12 bg-gray-300 animate-pulse rounded"></div>
              </div>
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
    <>
      <div className="min-h-[100vh] bg-[#01351f]">
        <UserHeader fullHeight={false} />
        <div className="max-w-5xl mx-auto px-5 py-4">
          <div className="flex flex-col items-center">
            <img src={profileIcon} alt="" className="w-[40px] h-[78px] mb-3" />
            <h1 className="text-white text-[16px] font-[800]">
              {t("manageProfile.title")}
            </h1>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-1">
                  {t("manageProfile.firstName")}
                </label>
                <input
                  className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(filterNameInput(e.target.value))
                  }
                  disabled={isSavingProfile}
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-1">
                  {t("manageProfile.lastName")}
                </label>
                <input
                  className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none disabled:bg-gray-200"
                  value={lastName}
                  onChange={(e) => setLastName(filterNameInput(e.target.value))}
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
              <div>
                <label className="block text-white text-sm mb-1">
                  {t("manageProfile.email")}
                </label>
                <input
                  type="email"
                  className="w-full rounded-md bg-white disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 px-4 py-2.5 outline-none"
                  value={email}
                  disabled
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-[#95C11F] hover:bg-[#7fb32d] text-white font-semibold rounded-lg py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-2"
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

          <form className="mt-8 space-y-4" onSubmit={handlePasswordUpdate}>
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
                className="w-full bg-[#95C11F] hover:bg-[#7fb32d] text-white font-semibold rounded-lg py-2.5 cursor-pointer transition-colors flex items-center justify-center gap-2"
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
    </>
  );
}
