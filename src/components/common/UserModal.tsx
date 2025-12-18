import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authSlice";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import loginModelLogo from "/src/assets/userImages/boligmatchLogo2.svg";
import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "../../features/auth/authSlice";
import ToastBanner from "./ToastBanner";
import SignUpModal from "./SignUpModal";

const schema = z.object({
  userName: z.string().min(1, "validation.usernameRequired"),
  password: z.string().min(1, "validation.passwordRequired"),
});

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
  roleTarget?: "user" | "partner";
  showSignUp?: boolean;
  hideCloseIcon?: boolean;
  closable?: boolean;
  enableAutoLoginAfterSignup?: boolean;
}

export default function UserModal({
  open,
  onClose,
  redirectTo,
  roleTarget = "user",
  showSignUp = false,
  hideCloseIcon = false,
  closable = true,
  enableAutoLoginAfterSignup = false,
}: UserModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const { t } = useTranslation();

  const showSuccess = (message: string) => {
    toast(
      ({ closeToast }) => (
        <ToastBanner
          type="success"
          message={message}
          onClose={closeToast}
          autoDismissMs={3000}
          fixed={false}
        />
      ),
      {
        position: "top-right",
        closeButton: false,
        hideProgressBar: true,
        autoClose: 3000,
        icon: false,
        style: { background: "transparent", boxShadow: "none", padding: 0 },
        className: "p-0 m-0",
      }
    );
  };

  const showError = (message: string) => {
    toast(
      ({ closeToast }) => (
        <ToastBanner
          type="error"
          message={message}
          onClose={closeToast}
          autoDismissMs={3000}
          fixed={false}
        />
      ),
      {
        position: "top-right",
        closeButton: false,
        hideProgressBar: true,
        autoClose: 3000,
        icon: false,
        style: { background: "transparent", boxShadow: "none", padding: 0 },
        className: "p-0 m-0",
      }
    );
  };

  const [mode, setMode] = useState<"login" | "forgot-email" | "otp" | "reset">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [newPassword, setNewPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const hasHandledLoginRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    if (hasHandledLoginRef.current) return;
    if (token && user) {
      try {
        const roleIds = String((user as any)?.roleIds ?? "");
        const roleName = String((user as any)?.roleName ?? "");

        const isAdmin =
          roleIds
            .split(",")
            .map((r: string) => r.trim())
            .includes("1") || roleName.toLowerCase() === "admin";
        if (isAdmin) {
          showError(
            t("auth.accessDenied") || "You are not authorised for login"
          );
          try {
            localStorage.removeItem("bm_user");
            localStorage.removeItem("bm_partner");
            localStorage.removeItem("bm_partnerId");
          } catch {}
          dispatch(logout());
          onClose();
          return;
        }

        const isPartner =
          roleIds
            .split(",")
            .map((r: string) => r.trim())
            .includes("2") || roleName === "Partner";
        const isUser =
          roleIds
            .split(",")
            .map((r: string) => r.trim())
            .includes("3") || roleName === "User";

        // IMPORTANT: enforce the selected login role.
        // - Partner login must be a "pure partner" account (role 2 only).
        // - User login must not accept "pure partner" accounts.
        const isPurePartner = isPartner && !isUser;
        if (roleTarget === "partner" && !isPurePartner) {
          showError(
            t("auth.partnerAccessDenied") ||
              t("auth.accessDenied") ||
              "Access denied. Please log in using a Partner account."
          );
          try {
            localStorage.removeItem("bm_access");
            localStorage.removeItem("bm_user");
            localStorage.removeItem("bm_partner");
            localStorage.removeItem("bm_partnerId");
          } catch {}
          dispatch(logout());
          // keep modal open for retry
          return;
        }
        if (roleTarget === "user" && isPurePartner) {
          showError(
            t("auth.userAccessDenied") ||
              t("auth.accessDenied") ||
              "Access denied. Please log in using a User account."
          );
          try {
            localStorage.removeItem("bm_access");
            localStorage.removeItem("bm_user");
            localStorage.removeItem("bm_partner");
            localStorage.removeItem("bm_partnerId");
          } catch {}
          dispatch(logout());
          // keep modal open for retry
          return;
        }

        hasHandledLoginRef.current = true;
        onClose();

        localStorage.setItem("bm_access", token);
        if (isPartner && !isUser) {
          localStorage.removeItem("bm_user");
          localStorage.setItem("bm_partner", JSON.stringify(user));
          localStorage.setItem("bm_partnerId", JSON.stringify(user.partnerId));

          showSuccess(
            t("supplierProfile.toast.partnerLoginSuccess") ||
              "Partner login successful!"
          );
        } else {
          localStorage.removeItem("bm_partner");
          localStorage.removeItem("bm_partnerId");

          localStorage.setItem("bm_user", JSON.stringify(user));
          showSuccess(
            t("supplierProfile.toast.loginSuccess") || "Login successful!"
          );
        }

        const from = (location.state as any)?.from?.pathname;
        const defaultByRole =
          isPartner && !isUser ? "/partner/statistics" : "/user/profile";
        
        // Check for recommendation partner ID in sessionStorage if no redirectTo is provided
        const handleNavigation = async () => {
          let target = redirectTo ?? from ?? defaultByRole;
          if (!redirectTo && !from) {
            const partnerId = sessionStorage.getItem("bm_recommendation_partner_id");
            if (partnerId) {
              // Fetch partner data and store in localStorage for SupplierProfile
              try {
                const { partnerService } = await import("../../services/partner.service");
                const partnerResponse = await partnerService.getById(Number(partnerId));
                if (partnerResponse?.output) {
                  localStorage.setItem("bm_currentPartner", JSON.stringify(partnerResponse.output));
                }
              } catch (error) {
                console.error("Error fetching partner data:", error);
              }
              target = "/user/supplier-profile";
              // Clear the recommendation keys
              sessionStorage.removeItem("bm_recommendation_key");
              sessionStorage.removeItem("bm_recommendation_partner_id");
            } else {
              const recommendationKey = sessionStorage.getItem("bm_recommendation_key");
              if (recommendationKey) {
                target = `/user/recommenduser/${recommendationKey}`;
              }
            }
          }
          
          navigate(target, { replace: true });
        };
        
        handleNavigation();
      } catch (e) {
        const from = (location.state as any)?.from?.pathname;
        
        // Check for recommendation partner ID in sessionStorage if no redirectTo is provided
        const handleNavigation = async () => {
          let target = redirectTo ?? from ?? "/user/profile";
          if (!redirectTo && !from) {
            const partnerId = sessionStorage.getItem("bm_recommendation_partner_id");
            if (partnerId) {
              // Fetch partner data and store in localStorage for SupplierProfile
              try {
                const { partnerService } = await import("../../services/partner.service");
                const partnerResponse = await partnerService.getById(Number(partnerId));
                if (partnerResponse?.output) {
                  localStorage.setItem("bm_currentPartner", JSON.stringify(partnerResponse.output));
                }
              } catch (error) {
                console.error("Error fetching partner data:", error);
              }
              target = "/user/supplier-profile";
              // Clear the recommendation keys
              sessionStorage.removeItem("bm_recommendation_key");
              sessionStorage.removeItem("bm_recommendation_partner_id");
            } else {
              const recommendationKey = sessionStorage.getItem("bm_recommendation_key");
              if (recommendationKey) {
                target = `/user/recommenduser/${recommendationKey}`;
              }
            }
          }
          
          navigate(target, { replace: true });
        };
        
        handleNavigation();
      }
    }
  }, [token, user, onClose, navigate, open, redirectTo]);

  React.useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const animationDuration = 400;

    if (open) {
      setIsAnimating(true);
      setIsVisible(false);
      showTimer = window.setTimeout(() => setIsVisible(true), 20);

      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        if (showTimer) window.clearTimeout(showTimer);
        document.body.style.overflow = original;
      };
    }

    if (!open && isAnimating) {
      setIsVisible(false);
      hideTimer = window.setTimeout(
        () => setIsAnimating(false),
        animationDuration
      );
    }

    return () => {
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [open, isAnimating]);

  const onSubmit = (data: { userName: string; password: string }) => {
    dispatch(loginThunk(data));
  };

  const handleForgotClick = () => {
    setMode("forgot-email");
    setFpError(null);
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.get(
        `https://boligmatch-api-mhqy4.ondigitalocean.app/api/Password/generateAndSendOTPToEmail/${encodeURIComponent(
          email
        )}`
      );
      setMode("otp");
      showSuccess(
        t("auth.resetPasswordDetails.otpSentSuccess") ||
          "OTP sent successfully to your email!"
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        t("auth.resetPasswordDetails.otpSendError") ||
        "Failed to send OTP";
      setFpError(errorMsg);
      showError(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  const onOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
    if (!value && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      const errorMsg = t("validation.otpLength") || "Enter 6-digit OTP";
      setFpError(errorMsg);
      showError(errorMsg);
      return;
    }
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.post(
        "https://boligmatch-api-mhqy4.ondigitalocean.app/api/User/emailOTPVerification",
        null,
        { params: { email, otp: Number(code) } }
      );
      setMode("reset");
      showSuccess(
        t("auth.resetPasswordDetails.otpVerifiedSuccess") ||
          "OTP verified successfully!"
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        t("auth.resetPasswordDetails.invalidOtp") ||
        "Invalid OTP";
      setFpError(errorMsg);
      showError(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      const errorMsg =
        t("validation.newPasswordRequired") || "Enter new password";
      setFpError(errorMsg);
      showError(errorMsg);
      return;
    }
    setFpLoading(true);
    setFpError(null);
    try {
      await axios.post(
        "https://boligmatch-api-mhqy4.ondigitalocean.app/api/Password/resetPassword",
        {
          email: email,
          otp: 0,
          newPassword: newPassword,
          hash: "",
          salt: "",
        }
      );
      showSuccess(
        t("auth.resetPasswordDetails.successMessage") ||
          "Password updated successfully!"
      );
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        t("auth.resetPasswordDetails.resetFailed") ||
        "Failed to update password";
      setFpError(errorMsg);
      showError(errorMsg);
    } finally {
      setFpLoading(false);
    }
  };

  const handleSignUpClick = () => {
    setIsSignUpOpen(true);
  };

  const handleSignupSuccess = async (email: string, password: string) => {
    // Auto-login after successful signup
    try {
      const result = await dispatch(loginThunk({ userName: email, password }));

      if (loginThunk.fulfilled.match(result)) {
        const { output } = result.payload;
        const loggedInUser = {
          userId: output.userId,
          firstName: output.firstName,
          lastName: output.lastName,
          email: output.email,
          avatar: output.avatar,
          role: output.role,
          roleIds: output.roleIds,
          roleName: output.roleName,
          franchiseId: output.franchiseId,
          admissionId: output.admissionId,
          mobileNo: output.mobileNo,
        };

        // Set localStorage like normal login flow
        localStorage.setItem("bm_access", output.token);
        localStorage.setItem("bm_user", JSON.stringify(loggedInUser));
        localStorage.removeItem("bm_partner");

        // Close signup modal
        setIsSignUpOpen(false);
        // Close login modal
        onClose();
        // Show success message
        showSuccess(
          t("signup.signupAndLoginSuccess") ||
            "Account created and logged in successfully!"
        );

        // Note: For recommendation flow, we don't redirect - we stay on the same page
        // The RecommendUser component will automatically detect authentication and show content
      } else {
        // If auto-login fails, just close signup modal and let user login manually
        setIsSignUpOpen(false);
        showError(
          t("signup.signupSuccessLoginManually") ||
            "Account created! Please log in with your credentials."
        );
      }
    } catch (error) {
      // If auto-login fails, just close signup modal and let user login manually
      setIsSignUpOpen(false);
      showError(
        t("signup.signupSuccessLoginManually") ||
          "Account created! Please log in with your credentials."
      );
    }
  };

  if (!open && !isAnimating && !isSignUpOpen) return null;

  return ReactDOM.createPortal(
    <>
      {(open || isAnimating) && !isSignUpOpen && (
        <div
          className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-400 ${
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-400 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closable ? onClose : undefined}
          />
          <div className="relative w-[370px] px-4">
            <div
              className={`relative rounded-[23px] bg-[#E6E7E9] shadow-2xl w-full transition-all duration-400 ${
                isVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-6"
              }`}
              style={{ willChange: "transform, opacity" }}
            >
              {!hideCloseIcon && closable && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-3 top-3 rounded-full p-1.5 text-black/80 hover:bg-black/5 hover:text-black transition cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              <div className="flex justify-center items-center p-6 pb-2">
                <img
                  src={loginModelLogo}
                  alt="Boligmatch+"
                  width={144}
                  height={36}
                  className="select-none"
                  style={{ opacity: 1, transform: "rotate(0deg)" }}
                  draggable={false}
                />
              </div>

              <div className="px-6 pb-6">
                <h2 className="text-[20px] font-[800] text-[#000000] text-center">
                  {mode === "login"
                    ? `${roleTarget === "partner" ? "Partner " : ""}${t(
                        "auth.login"
                      )}`
                    : mode === "forgot-email"
                    ? t("auth.forgotPassword") || "Forgot Password"
                    : mode === "otp"
                    ? t("auth.resetPasswordDetails.verifyOtp") || "Verify OTP"
                    : t("auth.resetPassword") || "Reset Password"}
                </h2>
              </div>

              {mode === "login" && error && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div className="px-6 pb-7">
                {mode === "login" && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label
                        htmlFor="userName"
                        className="block text-sm font-medium text-black mb-2"
                      >
                        {t("auth.username")}
                      </label>
                      <input
                        id="userName"
                        type="text"
                        className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                        placeholder={
                          t("auth.enterAdminUsername") ||
                          "Enter username or email"
                        }
                        {...register("userName")}
                      />
                      {errors.userName && (
                        <p className="text-xs text-red-600 mt-1">
                          {t(
                            errors.userName.message ||
                              "validation.usernameRequired"
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-black mb-2"
                      >
                        {t("auth.password")}
                      </label>
                      <input
                        id="password"
                        type="password"
                        className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                        placeholder={
                          t("auth.enterPassword") || "Enter your password"
                        }
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-xs text-red-600 mt-1">
                          {t(
                            errors.password.message ||
                              "validation.passwordRequired"
                          )}
                        </p>
                      )}
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={handleForgotClick}
                        className="text-black hover:text-gray-600 transition-colors font-normal cursor-pointer"
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    </div>
                    {showSignUp && roleTarget === "user" && (
                      <div className="text-sm">
                        {t("signup.noAccountQuestion") ||
                          "Don't have an account?"}{" "}
                        <button
                          type="button"
                          onClick={handleSignUpClick}
                          className="text-black hover:text-gray-600 transition-colors font-normal cursor-pointer"
                        >
                          {t("signup.signUpHere") || "Sign Up Here"}
                        </button>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            {t("auth.signingIn")}
                          </span>
                        ) : (
                          <>{t("auth.signIn")}</>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {mode === "forgot-email" && (
                  <form onSubmit={sendOtp} className="space-y-4">
                    {fpError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {fpError}
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-black mb-2"
                      >
                        {t("auth.email")}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                        placeholder={
                          t("auth.enterEmailAddress") || "Enter email address"
                        }
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={fpLoading}
                        className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {fpLoading
                          ? t("common.sending") || "Sending..."
                          : t("auth.sendOtp") || "Send Verification Code"}
                      </button>
                    </div>
                  </form>
                )}

                {mode === "otp" && (
                  <form onSubmit={verifyOtp} className="space-y-4">
                    {fpError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {fpError}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={d}
                          onChange={(e) => onOtpChange(i, e.target.value)}
                          className="w-10 h-12 text-center rounded-md bg-white px-2 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={fpLoading}
                        className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {fpLoading
                          ? t("common.verifying") || "Verifying..."
                          : t("auth.resetPasswordDetails.verifyOtp") ||
                            "Verify OTP"}
                      </button>
                    </div>
                  </form>
                )}

                {mode === "reset" && (
                  <form onSubmit={updatePassword} className="space-y-4">
                    {fpError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {fpError}
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-black mb-2"
                      >
                        {t("auth.newPassword") || "New Password"}
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-md bg-white px-3 py-2 shadow-inner outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#0A7B49]"
                        placeholder={
                          t("auth.enterNewPassword") || "Enter new password"
                        }
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={fpLoading}
                        className="w-full rounded-lg bg-[#7CCB4A] py-3 px-4 font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {fpLoading
                          ? t("common.updating") || "Updating..."
                          : t("manageProfile.updatePassword") ||
                            "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <SignUpModal
        open={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignupSuccess={
          enableAutoLoginAfterSignup ? handleSignupSuccess : undefined
        }
      />
    </>,
    document.body
  );
}
