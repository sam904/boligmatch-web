import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { userService } from "../../services/user.service";
import type { CreateUserRequest } from "../../types/user";
import logo from "/src/assets/userImages/boligmatchLogo2.png";
import { showSignupSuccessToast, showSignupErrorToast } from "./ToastBanner";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignupSuccess?: (email: string, password: string) => void;
}

export default function SignUpModal({
  open,
  onClose,
  onSignupSuccess,
}: SignUpModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("error", error);
  const [success, setSuccess] = useState(false);
  console.log("success", success);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const TRANSITION_DURATION = 300;

  useEffect(() => {
    let timeout: number | undefined;
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
    } else {
      setIsVisible(false);
      timeout = window.setTimeout(
        () => setShouldRender(false),
        TRANSITION_DURATION
      );
    }

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [shouldRender]);

  const schema = z.object({
    firstName: z.string().min(1, t("signup.nameRequired")),
    lastName: z.string().min(1, t("signup.nameRequired")),
    postalCode: z
      .string()
      .min(1, t("signup.postalCodeRequired"))
      .regex(/^[0-9]+$/, "Postal code must be numeric")
      .refine(
        (val) => val.length === 5,
        "Postal code must be exactly 5 digits"
      ),
    mobileNumber: z
      .string()
      .min(1, t("signup.mobileRequired"))
      .regex(/^[0-9]+$/, t("validation.mobileNumbersOnly"))
      .refine((val) => val.length === 8, t("validation.mobileInvalidLength")),
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

  const checkEmailAvailability = async (
    email: string
  ): Promise<{ isAvailable: boolean; message: string }> => {
    const trimmed = email.trim();
    if (!trimmed) {
      return {
        isAvailable: false,
        message: t("signup.emailInvalid") || "Email is required",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return {
        isAvailable: false,
        message: t("signup.emailInvalid") || "Invalid email format",
      };
    }

    try {
      const response = await userService.checkEmailOrMobileAvailability(
        trimmed
      );

      const message =
        response?.failureReason ||
        response?.output ||
        t("validation.emailAvailable") ||
        "Email is available";

      if (response?.isSuccess) {
        return { isAvailable: true, message };
      } else {
        return { isAvailable: false, message };
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const message =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        apiError?.message ||
        apiError?.output ||
        err?.message ||
        t("validation.emailCheckError") ||
        "Error checking email availability";

      return { isAvailable: false, message };
    }
  };

  const checkMobileAvailability = async (
    mobile: string
  ): Promise<{ isAvailable: boolean; message: string }> => {
    const cleanMobile = mobile.replace(/[\s\-\(\)]+/g, "");
    if (!cleanMobile) {
      return {
        isAvailable: false,
        message: t("signup.mobileRequired") || "Mobile number is required",
      };
    }

    if (cleanMobile.length !== 8 || !/^\d+$/.test(cleanMobile)) {
      return {
        isAvailable: false,
        message:
          t("validation.mobileInvalidLength") ||
          "Mobile number must be 8 digits",
      };
    }

    try {
      const response = await userService.checkEmailOrMobileAvailability(
        cleanMobile
      );

      const message =
        response?.failureReason ||
        response?.output ||
        t("validation.mobileAvailable") ||
        "Mobile number is available";

      if (response?.isSuccess) {
        return { isAvailable: true, message };
      } else {
        return { isAvailable: false, message };
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const message =
        apiError?.failureReason ||
        apiError?.errorMessage ||
        apiError?.message ||
        apiError?.output ||
        err?.message ||
        t("validation.mobileCheckError") ||
        "Error checking mobile number availability";

      return { isAvailable: false, message };
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First, check email availability
      const emailCheck = await checkEmailAvailability(data.email);
      if (!emailCheck.isAvailable) {
        setError(emailCheck.message);
        showSignupErrorToast(emailCheck.message);
        setIsLoading(false);
        return;
      }

      // Then, check mobile availability
      const mobileCheck = await checkMobileAvailability(data.mobileNumber);
      if (!mobileCheck.isAvailable) {
        setError(mobileCheck.message);
        showSignupErrorToast(mobileCheck.message);
        setIsLoading(false);
        return;
      }

      // If both are available, proceed with user creation
      const registrationData: CreateUserRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        mobileNo: data.mobileNumber,
        isActive: true,
        status: "Active",
      };

      await userService.add(registrationData);

      // If we get here, the registration was successful
      setSuccess(true);
      showSignupSuccessToast(
        "Registration successful! Welcome to Boligmatch+."
      );
      reset();

      // If onSignupSuccess callback is provided, call it with credentials for auto-login
      if (onSignupSuccess) {
        // Call the callback with email and password for auto-login
        setTimeout(() => {
          onSignupSuccess(data.email, data.password);
        }, 1000);
      } else {
        // Close modal after a short delay to show success message (default behavior)
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const msg =
        (typeof apiError === "string" && apiError.trim()) ||
        apiError?.failureReason ||
        apiError?.errorMessage ||
        apiError?.message?.output ||
        apiError?.message ||
        (apiError ? String(apiError) : "") ||
        "Registration failed";
      setError(msg);
      showSignupErrorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div
        className={`w-full max-w-2xl rounded-lg shadow-xl mx-4 my-16 bg-[#EFEFEF] transform transition-all duration-300 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center p-4 pb-2 relative">
          <div className="flex items-center justify-center p-2">
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
          {/* {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
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
          )} */}

          {/* Success Message */}
          {/* {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Registration successful! Welcome to Boligmatch+.
              </div>
            </div>
          )} */}

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
                  maxLength={5}
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
                  maxLength={8}
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
              <p>{t("signup.passwordRequirements")}</p>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-black space-y-2 bg-gray-50 p-3 rounded">
              <p>{t("signup.termsText1")}</p>
              <p>{t("signup.termsText2")}</p>
            </div>

            {/* Sign Up Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-[#91C73D] hover:bg-[#7fb32d] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? (
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
