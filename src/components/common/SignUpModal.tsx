import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { userService } from "../../services/user.service";
import type { CreateUserRequest } from "../../types/user";
import logo from "/src/assets/userImages/boligmatchLogo2.png";
import { showSignupSuccessToast, showSignupErrorToast } from "./ToastBanner";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignupSuccess?: (email: string, password: string) => void;
}

// Debounce hook for optimizing API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SignUpModal({
  open,
  onClose,
  onSignupSuccess,
}: SignUpModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // New states for availability checking
  const [emailAvailability, setEmailAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const [mobileAvailability, setMobileAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

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
    formState: { errors, touchedFields, isSubmitted },
    reset,
    watch,
    trigger,
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
    mode: "onTouched", // This triggers validation when fields are touched
  });

  // Watch email and mobile number for real-time validation
  const watchedEmail = watch("email");
  const watchedMobile = watch("mobileNumber");

  // Debounce the values to avoid too many API calls
  const debouncedEmail = useDebounce(watchedEmail, 500);
  const debouncedMobile = useDebounce(watchedMobile, 500);

  // Helper function to show error for a field
  const shouldShowError = (fieldName: keyof typeof touchedFields) => {
    return (touchedFields[fieldName] || isSubmitted) && errors[fieldName];
  };

  // Helper function to get input border color based on state
  const getInputBorderColor = (
    fieldName: keyof typeof touchedFields,
    availability?: { available: boolean | null; checking: boolean }
  ) => {
    // If field has error and is touched/submitted
    if (shouldShowError(fieldName)) {
      return "focus:ring-red-500 ring-2 ring-red-500";
    }
    
    // For email and mobile with availability check
    if (availability) {
      if (availability.checking) {
        return "focus:ring-blue-500";
      }
      if (availability.available === false) {
        return "focus:ring-red-500 ring-2 ring-red-500";
      }
      if (availability.available === true) {
        return "focus:ring-green-500 ring-2 ring-green-500";
      }
    }
    
    // Default focus color
    return "focus:ring-[#075835]";
  };

  // Check email availability
  const checkEmailAvailability = useCallback(async (email: string) => {
    const trimmed = email.trim();
    
    // Reset state if empty
    if (!trimmed) {
      setEmailAvailability({ checking: false, available: null, message: "" });
      return;
    }

    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailAvailability({ 
        checking: false, 
        available: false, 
        message: t("signup.emailInvalid") || "Invalid email format" 
      });
      return;
    }

    setEmailAvailability({ checking: true, available: null, message: "" });

    try {
      const response = await userService.checkEmailOrMobileAvailability(trimmed);
      
      const message = response?.failureReason || 
                     response?.output || 
                     t("validation.emailAvailable") || 
                     "Email is available";

      if (response?.isSuccess) {
        setEmailAvailability({ 
          checking: false, 
          available: true, 
          message: t("validation.emailAvailable") || "Email is available" 
        });
      } else {
        setEmailAvailability({ 
          checking: false, 
          available: false, 
          message: message || t("validation.emailNotAvailable") || "Email is already registered" 
        });
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const message = apiError?.failureReason ||
                     apiError?.errorMessage ||
                     apiError?.message ||
                     apiError?.output ||
                     err?.message ||
                     t("validation.emailCheckError") ||
                     "Error checking email availability";

      setEmailAvailability({ 
        checking: false, 
        available: false, 
        message 
      });
    }
  }, [t]);

  // Check mobile availability
  const checkMobileAvailability = useCallback(async (mobile: string) => {
    const cleanMobile = mobile.replace(/[\s\-\(\)]+/g, "");
    
    // Reset state if empty
    if (!cleanMobile) {
      setMobileAvailability({ checking: false, available: null, message: "" });
      return;
    }

    // Validate mobile format first
    if (cleanMobile.length !== 8 || !/^\d+$/.test(cleanMobile)) {
      setMobileAvailability({ 
        checking: false, 
        available: false, 
        message: t("validation.mobileInvalidLength") || "Mobile number must be 8 digits" 
      });
      return;
    }

    setMobileAvailability({ checking: true, available: null, message: "" });

    try {
      const response = await userService.checkEmailOrMobileAvailability(cleanMobile);
      
      const message = response?.failureReason || 
                     response?.output || 
                     t("validation.mobileAvailable") || 
                     "Mobile number is available";

      if (response?.isSuccess) {
        setMobileAvailability({ 
          checking: false, 
          available: true, 
          message: t("validation.mobileAvailable") || "Mobile number is available" 
        });
      } else {
        setMobileAvailability({ 
          checking: false, 
          available: false, 
          message: message || t("validation.mobileNotAvailable") || "Mobile number is already registered" 
        });
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const message = apiError?.failureReason ||
                     apiError?.errorMessage ||
                     apiError?.message ||
                     apiError?.output ||
                     err?.message ||
                     t("validation.mobileCheckError") ||
                     "Error checking mobile number availability";

      setMobileAvailability({ 
        checking: false, 
        available: false, 
        message 
      });
    }
  }, [t]);

  // Effect to check email availability when debounced email changes
  useEffect(() => {
    if (debouncedEmail) {
      checkEmailAvailability(debouncedEmail);
    }
  }, [debouncedEmail, checkEmailAvailability]);

  // Effect to check mobile availability when debounced mobile changes
  useEffect(() => {
    if (debouncedMobile && debouncedMobile.length === 8) {
      checkMobileAvailability(debouncedMobile);
    }
  }, [debouncedMobile, checkMobileAvailability]);

  // Helper function to check if email is unavailable
  const isEmailUnavailable = (): boolean => {
    return emailAvailability.available === false;
  };

  // Helper function to check if mobile is unavailable
  const isMobileUnavailable = (): boolean => {
    return mobileAvailability.available === false;
  };

  // Helper function to check if form can be submitted
  const canSubmitForm = (): boolean => {
    return !isEmailUnavailable() && !isMobileUnavailable();
  };

  const onSubmit = async (data: any) => {
    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) return;

    setIsLoading(true);

    try {
      // Final availability check before submission
      if (isEmailUnavailable()) {
        showSignupErrorToast(emailAvailability.message);
        setIsLoading(false);
        return;
      }

      if (isMobileUnavailable()) {
        showSignupErrorToast(mobileAvailability.message);
        setIsLoading(false);
        return;
      }

      // If availability states are still checking, wait a bit
      if (emailAvailability.checking || mobileAvailability.checking) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check again after waiting
        if (isEmailUnavailable() || isMobileUnavailable()) {
          showSignupErrorToast("Please wait while we verify your information");
          setIsLoading(false);
          return;
        }
      }

      // Proceed with user creation
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
      showSignupSuccessToast("Registration successful! Welcome to Boligmatch+.");
      reset();
      
      // Reset availability states
      setEmailAvailability({ checking: false, available: null, message: "" });
      setMobileAvailability({ checking: false, available: null, message: "" });

      // If onSignupSuccess callback is provided, call it with credentials for auto-login
      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess(data.email, data.password);
        }, 1000);
      } else {
        // Close modal after a short delay to show success message (default behavior)
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      const msg = (typeof apiError === "string" && apiError.trim()) ||
                 apiError?.failureReason ||
                 apiError?.errorMessage ||
                 apiError?.message?.output ||
                 apiError?.message ||
                 (apiError ? String(apiError) : "") ||
                 "Registration failed";
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
                  className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("firstName")}`}
                  {...register("firstName")}
                />
                {shouldShowError("firstName") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.firstName?.message}
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
                  className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("lastName")}`}
                  {...register("lastName")}
                />
                {shouldShowError("lastName") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.lastName?.message}
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
                  className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("postalCode")}`}
                  maxLength={5}
                  {...register("postalCode")}
                />
                {shouldShowError("postalCode") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.postalCode?.message}
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
                  className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("mobileNumber", mobileAvailability)}`}
                  maxLength={8}
                  {...register("mobileNumber")}
                />
                {/* Mobile availability status */}
                {mobileAvailability.checking && (
                  <p className="text-xs text-blue-600 mt-1">
                    Checking mobile number availability...
                  </p>
                )}
                {mobileAvailability.available === true && (
                  <p className="text-xs text-green-600 mt-1">
                    {mobileAvailability.message}
                  </p>
                )}
                {isMobileUnavailable() && (
                  <p className="text-xs text-red-600 mt-1">
                    {mobileAvailability.message}
                  </p>
                )}
                {shouldShowError("mobileNumber") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.mobileNumber?.message}
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
                className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("email", emailAvailability)}`}
                {...register("email")}
              />
              {/* Email availability status */}
              {emailAvailability.checking && (
                <p className="text-xs text-blue-600 mt-1">
                  Checking email availability...
                </p>
              )}
              {emailAvailability.available === true && (
                <p className="text-xs text-green-600 mt-1">
                  {emailAvailability.message}
                </p>
              )}
              {isEmailUnavailable() && (
                <p className="text-xs text-red-600 mt-1">
                  {emailAvailability.message}
                </p>
              )}
              {shouldShowError("email") && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.email?.message}
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
                className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("password")}`}
                {...register("password")}
              />
              {shouldShowError("password") && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password?.message}
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
                disabled={isLoading || !canSubmitForm()}
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
