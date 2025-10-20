import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { userService } from "../../services/user.service";
import type { CreateUserRequest } from "../../types/user";
import logo from "/src/assets/userImages/footerLogo.svg";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const schema = z.object({
    firstName: z.string().min(1, t("signup.nameRequired")),
    lastName: z.string().min(1, t("signup.nameRequired")),
    postalCode: z.string().min(1, t("signup.postalCodeRequired")),
    mobileNumber: z.string().min(1, t("signup.mobileRequired")),
    email: z.string().email(t("signup.emailInvalid")),
    password: z.string().min(6, t("signup.passwordMinLength")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      postalCode: "",
      mobileNumber: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const registrationData: CreateUserRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        mobileNo: data.mobileNumber,
        isActive: true, // Set new users as active by default
      };

      await userService.add(registrationData);
      
      // If we get here, the registration was successful
      setSuccess(true);
      reset();
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-lg shadow-xl mx-4 bg-[#EFEFEF]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center p-4 pb-2 relative">
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold">
              <img
                src={logo}
                alt=""
                className="h-8 w-auto"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(1000%) hue-rotate(120deg) brightness(0.3) contrast(1.2)",
                }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 text-black hover:text-gray-600 transition-colors text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-4">
          <h2 className="text-[20px] font-[800] text-[#000000] text-center">
            {t("signup.title")}
          </h2>
        </div>

        <div className="px-6 pb-4">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Registration successful! Welcome to Boligmatch+.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Row - First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-normal text-black mb-2"
                >
                  {t("signup.firstName")}
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-normal text-black mb-2"
                >
                  {t("signup.lastName")}
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Second Row - Postal Code and Mobile Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-normal text-black mb-2"
                >
                  {t("signup.postalCode")}
                </label>
                <input
                  id="postalCode"
                  type="text"
                  className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                  {...register("postalCode")}
                />
                {errors.postalCode && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-normal text-black mb-2"
                >
                  {t("signup.mobileNumber")}
                </label>
                <input
                  id="mobileNumber"
                  type="tel"
                  className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                  {...register("mobileNumber")}
                />
                {errors.mobileNumber && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Third Row - Email (full width) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-normal text-black mb-2"
              >
                {t("signup.email")}
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Fourth Row - Password (full width) */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-normal text-black mb-2"
              >
                {t("signup.password")}
              </label>
              <input
                id="password"
                type="password"
                className="w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#075835]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-black">
              <p>
                {t("signup.passwordRequirements")}
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-black space-y-2 bg-gray-50 p-3 rounded">
              <p>
                {t("signup.termsText1")}
              </p>
              <p>
                {t("signup.termsText2")}
              </p>
            </div>

            {/* Sign Up Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#91C73D] hover:bg-[#7fb32d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("common.loading")}
                  </span>
                ) : (
                  t("signup.acceptButton")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
