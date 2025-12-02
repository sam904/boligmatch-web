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

export default function SignUpModal({
  open,
  onClose,
  onSignupSuccess,
}: SignUpModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Updated states for validation (same as PartnersPage)
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const [mobileValidation, setMobileValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  // Debounce timers for email and mobile
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mobileDebounceTimer, setMobileDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
      if (mobileDebounceTimer) clearTimeout(mobileDebounceTimer);
    };
  }, [emailDebounceTimer, mobileDebounceTimer]);

  // Helper function to extract error message from API response
  const extractErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null) {
      // Try to get the most specific error message
      return (
        error.failureReason ||
        error.errorMessage ||
        error.message?.output ||
        error.message ||
        error.output ||
        JSON.stringify(error)
      );
    }
    return "Unknown error";
  };

  // Email validation function - IMPROVED VERSION
  const validateEmailAvailability = useCallback(async (email: string) => {
    if (!email) {
      setEmailValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({
        checking: false,
        available: false,
        message: t("validation.emailInvalidFormat") || "Please enter a valid email address",
      });
      return;
    }

    setEmailValidation({
      checking: true,
      available: null,
      message: "",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(email);

      if (response.isSuccess) {
        setEmailValidation({
          checking: false,
          available: true,
          message: t("validation.emailAvailable") || "Email is available",
        });
      } else {
        // Extract the error message from API response
        const errorMessage = extractErrorMessage(response);
        
        // Check for specific email-related error messages
        let userMessage = errorMessage;
        if (errorMessage.toLowerCase().includes("email") || 
            errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("registered")) {
          userMessage = t("validation.emailAlreadyRegistered") || "Email already registered";
        }

        setEmailValidation({
          checking: false,
          available: false,
          message: userMessage,
        });
      }
    } catch (error: any) {
      console.error("Email validation error:", error);

      // Handle API errors specifically
      if (error.response?.status === 400) {
        const apiError = error.response.data;
        const errorMessage = extractErrorMessage(apiError);
        
        let userMessage = errorMessage;
        if (errorMessage.toLowerCase().includes("email") || 
            errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("registered")) {
          userMessage = t("validation.emailAlreadyRegistered") || "Email already registered";
        }

        setEmailValidation({
          checking: false,
          available: false,
          message: userMessage,
        });
      } else {
        setEmailValidation({
          checking: false,
          available: null,
          message: t("validation.emailCheckError") || "Error checking email availability",
        });
      }
    }
  }, [t]);

  // Mobile validation function - IMPROVED VERSION
  const validateMobileAvailability = useCallback(async (mobileNo: string) => {
    if (!mobileNo) {
      setMobileValidation({
        checking: false,
        available: null,
        message: "",
      });
      return;
    }

    // Clean mobile number (remove spaces, dashes, etc.)
    const cleanMobile = mobileNo.replace(/[\s\-\(\)]+/g, "");

    // Basic mobile validation - exactly 8 digits
    if (cleanMobile.length !== 8) {
      setMobileValidation({
        checking: false,
        available: false,
        message: t("validation.mobileInvalidLength") || "Mobile number must be exactly 8 digits",
      });
      return;
    }

    // Validate that it contains only digits
    if (!/^\d+$/.test(cleanMobile)) {
      setMobileValidation({
        checking: false,
        available: false,
        message: t("validation.mobileNumbersOnly") || "Mobile number can only contain numbers",
      });
      return;
    }

    setMobileValidation({
      checking: true,
      available: null,
      message: "",
    });

    try {
      const response = await userService.checkEmailOrMobileAvailability(cleanMobile);

      if (response.isSuccess) {
        setMobileValidation({
          checking: false,
          available: true,
          message: t("validation.mobileAvailable") || "Mobile number is available",
        });
      } else {
        // Extract the error message from API response
        const errorMessage = extractErrorMessage(response);
        
        // Check for specific mobile-related error messages
        let userMessage = errorMessage;
        if (errorMessage.toLowerCase().includes("mobile") || 
            errorMessage.toLowerCase().includes("phone") ||
            errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("registered")) {
          userMessage = t("validation.mobileAlreadyRegistered") || "Mobile number already registered";
        }

        setMobileValidation({
          checking: false,
          available: false,
          message: userMessage,
        });
      }
    } catch (error: any) {
      console.error("Mobile validation error:", error);

      // Handle API errors specifically
      if (error.response?.status === 400) {
        const apiError = error.response.data;
        const errorMessage = extractErrorMessage(apiError);
        
        let userMessage = errorMessage;
        if (errorMessage.toLowerCase().includes("mobile") || 
            errorMessage.toLowerCase().includes("phone") ||
            errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("registered")) {
          userMessage = t("validation.mobileAlreadyRegistered") || "Mobile number already registered";
        }

        setMobileValidation({
          checking: false,
          available: false,
          message: userMessage,
        });
      } else {
        setMobileValidation({
          checking: false,
          available: null,
          message: t("validation.mobileCheckError") || "Error checking mobile number availability",
        });
      }
    }
  }, [t]);

  // Debounced email validation handler
  const handleEmailChange = (email: string) => {
    setValue("email", email, { shouldValidate: true });

    // Clear existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateEmailAvailability(email);
    }, 800); // 800ms debounce

    setEmailDebounceTimer(timer);
  };

  // Debounced mobile validation handler
  const handleMobileChange = (mobileNo: string) => {
    setValue("mobileNumber", mobileNo, { shouldValidate: true });

    // Clear existing timer
    if (mobileDebounceTimer) {
      clearTimeout(mobileDebounceTimer);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      validateMobileAvailability(mobileNo);
    }, 800); // 800ms debounce

    setMobileDebounceTimer(timer);
  };

  const schema = z.object({
    firstName: z.string().min(1, t("signup.nameRequired")),
    lastName: z.string().min(1, t("signup.nameRequired")),
    postalCode: z
      .string()
      .min(1, t("signup.postalCodeRequired"))
      .regex(/^[0-9]+$/, "Postal code must be numeric")
      .refine(
        (val) => val.length === 4,
       t("signup.postalCodeLength")
      ),
    mobileNumber: z
      .string()
      .min(1, t("signup.mobileRequired"))
      .regex(/^[0-9]+$/, t("validation.mobileNumbersOnly"))
      .refine((val) => val.length === 8, t("validation.mobileInvalidLength")),
    email: z.string().email(t("signup.emailInvalid")),
    password: z.string().min(6, t("signup.passwordMinLength")),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
    reset,
    watch,
    trigger,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      postalCode: "",
      mobileNumber: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  // Watch email and mobile number
  const emailValue = watch("email");
  const mobileNumberValue = watch("mobileNumber");

  // Helper function to show error for a field
  const shouldShowError = (fieldName: keyof FormData) => {
    return (touchedFields[fieldName] || isSubmitted) && errors[fieldName];
  };

  // Helper function to get input border color based on state
  const getInputBorderColor = (
    fieldName: keyof FormData,
    validation?: { available: boolean | null; checking: boolean }
  ) => {
    // If field has error and is touched/submitted
    if (shouldShowError(fieldName)) {
      return "focus:ring-red-500 ring-2 ring-red-500";
    }
    
    // For email and mobile with validation check
    if (validation) {
      if (validation.checking) {
        return "focus:ring-blue-500";
      }
      if (validation.available === false) {
        return "focus:ring-red-500 ring-2 ring-red-500";
      }
      if (validation.available === true) {
        return "focus:ring-green-500 ring-2 ring-green-500";
      }
    }
    
    // Default focus color
    return "focus:ring-[#075835]";
  };

  // Helper function to check if email is unavailable
  const isEmailUnavailable = (): boolean => {
    return emailValidation.available === false;
  };

  // Helper function to check if mobile is unavailable
  const isMobileUnavailable = (): boolean => {
    return mobileValidation.available === false;
  };

  // Helper function to check if form can be submitted
  const canSubmitForm = (): boolean => {
    return !isEmailUnavailable() && !isMobileUnavailable();
  };

  const onSubmit = async (data: FormData) => {
    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) return;

    // Check if email or mobile validations are in progress
    if (emailValidation.checking || mobileValidation.checking) {
      showSignupErrorToast("Please wait for email/mobile validation to complete");
      return;
    }

    // Check if email validation failed
    if (data.email && emailValidation.available === false) {
      showSignupErrorToast(emailValidation.message);
      return;
    }

    // Check if mobile validation failed
    if (data.mobileNumber && mobileValidation.available === false) {
      showSignupErrorToast(mobileValidation.message);
      return;
    }

    setIsLoading(true);

    try {
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
      
      // Reset validation states
      setEmailValidation({ checking: false, available: null, message: "" });
      setMobileValidation({ checking: false, available: null, message: "" });

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
      const msg = extractErrorMessage(apiError || err);
      
      // Check if it's an email/mobile already exists error
      let userMessage = msg;
      if (msg.toLowerCase().includes("email") || 
          msg.toLowerCase().includes("mobile") ||
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exists")) {
        if (msg.toLowerCase().includes("email")) {
          userMessage = t("validation.emailAlreadyRegistered") || "Email already registered";
          setEmailValidation({ 
            checking: false, 
            available: false, 
            message: userMessage 
          });
        } else if (msg.toLowerCase().includes("mobile")) {
          userMessage = t("validation.mobileAlreadyRegistered") || "Mobile number already registered";
          setMobileValidation({ 
            checking: false, 
            available: false, 
            message: userMessage 
          });
        }
      }
      
      showSignupErrorToast(userMessage);
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
                  className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("mobileNumber", mobileValidation)}`}
                  value={mobileNumberValue || ""}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder={
                    t("common.mobilePlaceholder") ||
                    "Enter 8-digit mobile number"
                  }
                  maxLength={8}
                />
                {/* Mobile validation status */}
                {mobileValidation.checking && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm mt-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    {t("admin.partners.mobileChecking") ||
                      "Checking mobile number availability..."}
                  </div>
                )}
                {mobileValidation.available === true &&
                  !mobileValidation.checking && (
                    <div className="text-green-600 text-sm mt-1 flex items-center gap-1">
                     
                      {t("admin.partners.mobileAvailable") ||
                        "Mobile number is available"}
                    </div>
                  )}
                {mobileValidation.available === false &&
                  !mobileValidation.checking && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                     
                      {mobileValidation.message}
                    </div>
                  )}
                {shouldShowError("mobileNumber") &&
                  mobileValidation.available !== false && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    
                      {errors.mobileNumber?.message}
                    </div>
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
                className={`w-full bg-white border-0 rounded px-3 py-2 focus:outline-none focus:ring-2 ${getInputBorderColor("email", emailValidation)}`}
                value={emailValue || ""}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder={
                  t("common.enterEmailAddress") || "Enter email address"
                }
              />
              {/* Email validation status */}
              {emailValidation.checking && (
                <div className="flex items-center gap-2 text-blue-600 text-sm mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  {t("admin.partners.emailChecking") ||
                    "Checking email availability..."}
                </div>
              )}
              {emailValidation.available === true &&
                !emailValidation.checking && (
                  <div className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    {/* <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg> */}
                    {t("admin.partners.emailAvailable") ||
                      "Email is available"}
                  </div>
                )}
              {emailValidation.available === false &&
                !emailValidation.checking && (
                  <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    {/* <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg> */}
                    {emailValidation.message}
                  </div>
                )}
              {shouldShowError("email") &&
                emailValidation.available !== false && (
                  <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email?.message}
                  </div>
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