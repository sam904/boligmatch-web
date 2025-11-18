import { useForm } from "react-hook-form";
import { useState } from "react";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk, logout } from "./authSlice";
import { Navigate, useLocation } from "react-router-dom";
import login_cover from "../../../public/login_cover.png";
import logo_2 from "../../../public/logo_2.svg";
import { IconEye, IconEyeOff } from "../../components/common/Icons/Index";
import { CustomCheckbox } from "../../components/common/CheckBox";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.accessToken);
  const user = useAppSelector((s) => s.auth.user);
  const error = useAppSelector((s) => s.auth.error);
  const loc = useLocation();

  const schema = z.object({
    userName: z.string().min(1, t("validation.usernameRequired") || "Username/Email is required"),
    password: z.string().min(1, t("validation.passwordRequired") || "Password is required"),
  });

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

  const onSubmit = async (data: any) => {
    setAdminError(null);

    const result = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(result)) {
      if (result.payload.output.roleName.toLowerCase() !== "admin") {
        setAdminError(
          t("auth.adminAccessDenied") ||
            "Access denied. This portal is for administrators only."
        );
        dispatch(logout());
      }
    }
  };

  if (token && user && user.roleName.toLowerCase() === "admin") {
    return (
      <Navigate to={(loc.state as any)?.from?.pathname ?? "/admin"} replace />
    );
  }

  if (token && user && user.roleName.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t("auth.accessDenied") || "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("auth.adminPortalOnly") ||
              "This portal is for administrators only."}
          </p>
          <button
            onClick={() => dispatch(logout())}
            className="bg-[#004E34] text-white px-6 py-2 rounded-lg hover:bg-[#003b27] transition-colors cursor-pointer"
          >
            {t("auth.returnToLogin") || "Return to Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-10 sm:px-14 md:px-24">
        {/* Centered Logo */}
        <div className="flex justify-center mb-9">
          <img
            src={logo_2}
            alt="boligmatch logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Login Header - Centered */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t("auth.adminLogin") || "Admin Login"}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("auth.adminAccessOnly") || "Administrator access only"}
          </p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Admin Access Error */}
        {adminError && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {adminError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-md mx-auto w-full"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm cursor-pointer">
              {t("auth.username") || "Username/Email"}
            </label>
            <input
              type="text"
              {...register("userName")}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                errors.userName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={
                t("auth.enterAdminUsername") || "Enter admin username or email"
              }
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-medium mb-2 text-sm cursor-pointer">
                {t("auth.password") || "Password"}
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[#0C2A92] hover:underline font-medium text-sm cursor-pointer"
              >
                {t("auth.forgotPassword") || "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004E34] focus:outline-none transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("auth.enterPassword") || "Enter your password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                {showPassword ? (
                  <IconEyeOff className="w-5 h-5" />
                ) : (
                  <IconEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center cursor-pointer">
              <CustomCheckbox
                checked={rememberMe}
                onChange={setRememberMe}
                label={t("auth.rememberMe") || "Remember for 30 days"}
              />
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full bg-[#004E34] text-white py-3 rounded-lg font-bold transition-all duration-200 shadow-md ${
              status === "loading"
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-[#003b27] cursor-pointer"
            }`}
          >
            {status === "loading"
              ? t("auth.signingIn") || "Signing In..."
              : t("auth.login") || "Login"}
          </button>
        </form>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={login_cover}
          alt="Login cover"
          className="w-full rounded-l-4xl h-screen object-cover"
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          onSuccess={() => {
            console.log("Password reset successful");
          }}
        />
      </div>
    </div>
  );
}
